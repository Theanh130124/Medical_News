"""
rag_chatbot.py (updated)
------------------------
RAG System với tích hợp X-ray classifier (ViT-MAE).
Luồng mới khi có ảnh:
  1. classify_xray(image_bytes) → kết quả phân tích
  2. Ghép kết quả vào query để retrieve tài liệu y tế liên quan
  3. LLM giải thích kết quả dựa trên tài liệu RAG
"""

import os
import requests
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_qdrant import QdrantVectorStore
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import HumanMessage, AIMessage
from sentence_transformers import CrossEncoder
from redis_cache import RedisPromptCache
from dotenv import load_dotenv

from xray_classifier import classify_xray, format_xray_result

load_dotenv()


SPRINGBOOT_BASE_URL       = os.getenv("SPRINGBOOT_BASE_URL")
SPRINGBOOT_INTERNAL_TOKEN = os.getenv("SPRINGBOOT_INTERNAL_TOKEN")

QDRANT_URL          = os.getenv("QDRANT_URL")
QDRANT_API_KEY      = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME     = os.getenv("COLLECTION_NAME", "medical")
MODEL_LLM_NAME      = os.getenv("MODEL_LLM_NAME")
OPENROUTER_API_KEY  = os.getenv("OPENROUTER_API_KEY")
MODEL_CROSS_ENCODER = os.getenv("MODEL_CROSS_ENCODER")


class RAGSystem:
    def __init__(self):
        # Embedding model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="dangvantuan/vietnamese-embedding"
        )

        # Qdrant vector store
        self.docsearch = QdrantVectorStore.from_existing_collection(
            embedding=self.embeddings,
            url=QDRANT_URL,
            api_key=QDRANT_API_KEY,
            collection_name=COLLECTION_NAME,
        )
        self.retriever = self.docsearch.as_retriever(
            search_type="similarity",
            search_kwargs={"k": 40},
        )

        # Cross-encoder reranker
        self.cross_encoder = CrossEncoder(MODEL_CROSS_ENCODER)

        # LLM
        self.llm = ChatOpenAI(
            model=MODEL_LLM_NAME,
            openai_api_key=OPENROUTER_API_KEY,
            openai_api_base="https://openrouter.ai/api/v1",
            temperature=0.4,
            max_tokens=2048,
        )

        # System prompt (text-only queries)
        self.system_prompt = (
            "Bạn là một trợ lý tư vấn y tế chuyên nghiệp, "
            "có nhiệm vụ hỗ trợ và cung cấp thông tin sức khỏe cho người dùng dựa trên "
            "**thông tin ngữ cảnh được cung cấp** và **lịch sử hội thoại trước đó**.\n"
            "Chỉ sử dụng thông tin trong ngữ cảnh — không được suy đoán hoặc bịa thêm.\n"
            "Nếu không đủ thông tin, trả lời: "
            "'Xin lỗi, tôi không có đủ thông tin y khoa để trả lời câu hỏi này.'\n\n"
            "Ngữ cảnh tài liệu:\n{context}\n\n"
            "HƯỚNG DẪN:\n"
            "1. Trả lời bằng tiếng Việt tự nhiên, rõ ràng, tối đa 6–8 câu\n"
            "2. Lĩnh vực: triệu chứng, chẩn đoán, điều trị, phòng ngừa, chăm sóc sức khỏe\n"
            "3. Đưa ra lời khuyên an toàn, mang tính tham khảo\n"
            "4. Khuyến nghị tham khảo bác sĩ khi cần thiết\n"
            "5. Không đưa ra chẩn đoán chắc chắn hoặc thay thế bác sĩ\n"
        )

        # System prompt dành riêng cho X-ray analysis
        self.xray_system_prompt = (
            "Bạn là một trợ lý y tế chuyên về phân tích X-quang ngực.\n"
            "Dưới đây là kết quả phân tích từ mô hình AI (ViT-MAE) và tài liệu y tế liên quan.\n\n"
            "Kết quả AI X-quang:\n{xray_result}\n\n"
            "Ngữ cảnh tài liệu y tế:\n{context}\n\n"
            "HƯỚNG DẪN:\n"
            "1. Giải thích ngắn gọn từng dấu hiệu bệnh lý mà AI phát hiện (nếu có)\n"
            "2. Dựa vào tài liệu để mô tả triệu chứng, nguyên nhân, hướng điều trị\n"
            "3. Nhấn mạnh đây chỉ là hỗ trợ AI, KHÔNG thay thế bác sĩ chẩn đoán\n"
            "4. Khuyến nghị bệnh nhân đến khám bác sĩ chuyên khoa hô hấp/tim mạch\n"
            "5. Trả lời bằng tiếng Việt, rõ ràng, tối đa 10 câu\n"
            "6. Nếu câu hỏi của người dùng không liên quan đến X-quang, "
            "   vẫn trả lời dựa trên ngữ cảnh tài liệu thông thường\n"
        )

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ])

        self.xray_prompt = ChatPromptTemplate.from_messages([
            ("system", self.xray_system_prompt),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ])

        # Redis cache
        self.cache = RedisPromptCache(
            host=os.getenv("REDIS_HOST", "localhost"),
            port=int(os.getenv("REDIS_PORT", 6379)),
            db=int(os.getenv("REDIS_DB", 0)),
            password=os.getenv("REDIS_PASSWORD"),
            prefix="rag_prompt_cache:",
        )

        self.cache_hits   = 0
        self.cache_misses = 0

    # ── Spring Boot API helpers ───────────────────────────────────────────────

    def _sb_headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "X-Internal-Token": SPRINGBOOT_INTERNAL_TOKEN,
        }

    def _get_chat_history(self, conversation_id: str) -> list:
        url = f"{SPRINGBOOT_BASE_URL}/api/internal/conversations/{conversation_id}/messages"
        try:
            resp = requests.get(url, headers=self._sb_headers(), timeout=5)
            resp.raise_for_status()
            messages_raw = resp.json().get("result", [])
        except Exception as e:
            print(f"[RAG] Không lấy được lịch sử chat: {e}")
            return []

        history = []
        for msg in messages_raw:
            mtype   = msg.get("messageType", "")
            content = msg.get("content", "")
            if mtype == "user":
                history.append(HumanMessage(content=content))
            elif mtype == "bot":
                history.append(AIMessage(content=content))
        return history

    def _save_messages(
        self, conversation_id: str, user_id: str,
        user_query: str, bot_answer: str,
        image_url: str = None,
    ) -> None:
        url = f"{SPRINGBOOT_BASE_URL}/api/internal/conversations/{conversation_id}/messages"
        user_msg = {"content": user_query, "messageType": "user", "isHtml": False}
        if image_url:
            user_msg["imageUrl"] = image_url
        payload = {
            "userId":   user_id,
            "messages": [
                user_msg,
                {"content": bot_answer, "messageType": "bot", "isHtml": False},
            ],
        }
        try:
            resp = requests.post(url, json=payload, headers=self._sb_headers(), timeout=5)
            resp.raise_for_status()
        except Exception as e:
            print(f"[RAG] Lưu tin nhắn thất bại: {e}")

    # ── Reranking ─────────────────────────────────────────────────────────────

    def _rerank(self, query: str, docs: list, top_n: int = 5) -> list:
        pairs  = [[query, doc.page_content] for doc in docs]
        scores = self.cross_encoder.predict(pairs)
        ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked[:top_n]]

    # ── X-ray branch ──────────────────────────────────────────────────────────

    def _build_xray_retrieve_query(self, xray_result: dict, user_text: str) -> str:
        """
        Tạo query cho Qdrant dựa trên kết quả X-ray + câu hỏi người dùng.
        Ưu tiên tên bệnh tiếng Anh vì tài liệu có thể dùng thuật ngữ quốc tế.
        """
        base = " ".join(xray_result.get("findings", []))
        vi   = " ".join(xray_result.get("findings_vi", []))
        q    = f"{base} {vi} {user_text}".strip()
        return q or "X-quang ngực bệnh phổi"

    def _get_xray_rag_response(
        self,
        image_bytes: bytes,
        user_text: str,
        chat_history: list,
    ) -> tuple:
        """
        Phân tích ảnh X-ray → retrieve docs → LLM → trả về (answer, xray_result).
        """
        # 1. Classify ảnh
        xray_result   = classify_xray(image_bytes)
        xray_text     = format_xray_result(xray_result)

        # 2. Retrieve tài liệu liên quan
        retrieve_query = self._build_xray_retrieve_query(xray_result, user_text)
        similar_docs   = self.retriever.invoke(retrieve_query)
        top_docs       = self._rerank(retrieve_query, similar_docs, top_n=5)

        # 3. Build display input cho LLM
        display_input = user_text if user_text else "Phân tích kết quả X-quang này cho tôi."

        # 4. Gọi LLM với xray prompt
        qa_chain = create_stuff_documents_chain(self.llm, self.xray_prompt)
        answer_raw = qa_chain.invoke({
            "input":        display_input,
            "context":      top_docs,
            "chat_history": chat_history,
            "xray_result":  xray_text,
        })
        answer = answer_raw if isinstance(answer_raw, str) else answer_raw.get("answer", "")

        if not answer:
            answer = "Xin lỗi, tôi không thể xử lý ảnh X-quang của bạn lúc này."

        return answer, xray_result

    # ── Main entry point ──────────────────────────────────────────────────────

    def get_rag_response(
        self,
        query: str,
        conversation_id: str,
        user_id: str = None,
        image_bytes: bytes = None,
        image_url: str = None,
    ) -> dict:
        """
        Trả về dict:
            {
                "answer":      str,
                "xray_result": dict | None,   # None nếu không có ảnh
            }

        Luồng:
          - Nếu có ảnh → X-ray classify + RAG giải thích
          - Nếu chỉ text → RAG thuần như cũ
        """
        # 1. Cache check (chỉ cache text queries, không cache image queries)
        if not image_bytes:
            cached = self.cache.retrieve(query)
            if cached:
                self.cache_hits += 1
                print(f"[RAG] Cache hit: {query[:60]}")
                return {"answer": cached["response"], "xray_result": None}

        self.cache_misses += 1

        # 2. Lịch sử hội thoại
        chat_history = self._get_chat_history(conversation_id) if conversation_id else []

        # 3. Xử lý theo nhánh
        xray_result = None
        if image_bytes:
            try:
                answer, xray_result = self._get_xray_rag_response(
                    image_bytes, query, chat_history
                )
            except Exception as e:
                print(f"[RAG] X-ray error: {e}")
                answer = (
                    "Xin lỗi, tôi không thể phân tích ảnh X-quang này. "
                    "Vui lòng đảm bảo ảnh rõ nét và đúng định dạng X-quang ngực. "
                    "Nếu bạn có câu hỏi y tế khác, tôi sẵn sàng hỗ trợ!"
                )
        else:
            # Text-only RAG
            similar_docs = self.retriever.invoke(query)
            top_docs     = self._rerank(query, similar_docs, top_n=5)

            qa_chain   = create_stuff_documents_chain(self.llm, self.prompt)
            answer_raw = qa_chain.invoke({
                "input":        query,
                "context":      top_docs,
                "chat_history": chat_history,
            })
            answer = answer_raw if isinstance(answer_raw, str) else answer_raw.get("answer", "")

            if not answer:
                answer = "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này."

        # 4. Lưu tin nhắn về Spring Boot
        if conversation_id and user_id:
            self._save_messages(
                conversation_id, user_id, query, answer,
                image_url=image_url,
            )

        # 5. Cache (chỉ với text query)
        if not image_bytes:
            self.cache.store(
                query=query,
                response=answer,
                conversation_id=conversation_id,
                user_id=user_id,
                metadata={
                    "model": MODEL_LLM_NAME,
                },
            )

        return {"answer": answer, "xray_result": xray_result}

    def get_cache_stats(self) -> dict:
        total = self.cache_hits + self.cache_misses
        return {
            "redis_stats":  self.cache.get_stats(),
            "cache_hits":   self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate":     self.cache_hits / total if total > 0 else 0,
        }


# Singleton
rag_chatbot = RAGSystem()