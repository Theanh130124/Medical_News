
#IMPORT CŨ
# import os
# from langchain_community.embeddings import HuggingFaceEmbeddings
# from langchain_qdrant import QdrantVectorStore
# from langchain_community.chat_models import ChatOpenAI
# #cài requirements rồi cài pip install langchain==0.3.27 cài về cái này
# from langchain.memory import ConversationBufferMemory
# from langchain.chains import create_retrieval_chain
# from langchain.chains.combine_documents import create_stuff_documents_chain
# from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
# from langchain_core.messages import HumanMessage, AIMessage
# from app import app
# from redis_cache import cache


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


load_dotenv()

SPRINGBOOT_BASE_URL    = os.getenv("SPRINGBOOT_BASE_URL")
SPRINGBOOT_INTERNAL_TOKEN = os.getenv("SPRINGBOOT_INTERNAL_TOKEN")


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
            search_kwargs={"k": 40}
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

        # System prompt
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

        self.prompt = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
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

        # Monitoring counters
        self.cache_hits = 0
        self.cache_misses = 0

    # ── Spring Boot API helpers ───────────────────────────────────────────────

    def _get_chat_history(self, conversation_id: str) -> list:
        """
        GET /api/internal/conversations/{id}/messages
        Trả về list HumanMessage / AIMessage cho LangChain.
        """
        url = f"{SPRINGBOOT_BASE_URL}/api/internal/conversations/{conversation_id}/messages"
        try:
            resp = requests.get(url, headers=_sb_headers(), timeout=5)
            resp.raise_for_status()
            messages_raw = resp.json().get("result", [])
        except Exception as e:
            print(f"[RAG] Không lấy được lịch sử chat: {e}")
            return []

        history = []
        for msg in messages_raw:
            mtype = msg.get("messageType", "")
            content = msg.get("content", "")
            if mtype == "user":
                history.append(HumanMessage(content=content))
            elif mtype == "bot":
                history.append(AIMessage(content=content))
        return history

    def _save_messages(self, conversation_id: str, user_id: str,
                       user_query: str, bot_answer: str) -> None:
        """
        POST /api/internal/conversations/{id}/messages
        Lưu cả tin user lẫn bot về Spring Boot (gộp 1 request).
        """
        url = f"{SPRINGBOOT_BASE_URL}/api/internal/conversations/{conversation_id}/messages"
        payload = {
            "userId": user_id,
            "messages": [
                {"content": user_query, "messageType": "user", "isHtml": False},
                {"content": bot_answer, "messageType": "bot", "isHtml": False},
            ],
        }
        try:
            resp = requests.post(url, json=payload, headers=_sb_headers(), timeout=5)
            resp.raise_for_status()
        except Exception as e:
            print(f"[RAG] Lưu tin nhắn thất bại: {e}")

    # ── Reranking ─────────────────────────────────────────────────────────────

    def _rerank(self, query: str, docs: list, top_n: int = 5) -> list:
        pairs = [[query, doc.page_content] for doc in docs]
        scores = self.cross_encoder.predict(pairs)
        ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
        return [doc for doc, _ in ranked[:top_n]]

    # ── Main entry point ──────────────────────────────────────────────────────

    def get_rag_response(self, query: str, conversation_id: str,
                         user_id: str = None) -> str:
        """
        1. Kiểm tra Redis cache
        2. Lấy lịch sử từ Spring Boot API
        3. Retrieve + rerank tài liệu từ Qdrant
        4. Gọi LLM
        5. Lưu tin nhắn về Spring Boot
        6. Lưu kết quả vào Redis cache
        """
        # 1. Cache check
        cached = self.cache.retrieve(query)
        if cached:
            self.cache_hits += 1
            print(f"[RAG] Cache hit: {query[:60]}")
            return cached["response"]

        self.cache_misses += 1

        # 2. Lịch sử hội thoại
        chat_history = self._get_chat_history(conversation_id) if conversation_id else []

        # 3. Retrieve + rerank
        similar_docs = self.retriever.invoke(query)
        top_docs = self._rerank(query, similar_docs, top_n=5)

        # 4. Gọi LLM
        qa_chain = create_stuff_documents_chain(self.llm, self.prompt)
        answer_raw = qa_chain.invoke({
            "input": query,
            "context": top_docs,
            "chat_history": chat_history,
        })
        answer = answer_raw if isinstance(answer_raw, str) else answer_raw.get("answer", "")

        if not answer:
            answer = "Xin lỗi, tôi không thể xử lý yêu cầu của bạn lúc này."

        # 5. Lưu tin nhắn về Spring Boot
        if conversation_id and user_id:
            self._save_messages(conversation_id, user_id, query, answer)

        # 6. Lưu vào Redis
        self.cache.store(
            query=query,
            response=answer,
            conversation_id=conversation_id,
            user_id=user_id,
            metadata={
                "retrieved_docs": len(top_docs),
                "model": MODEL_LLM_NAME,
            },
        )

        return answer

    def get_cache_stats(self) -> dict:
        total = self.cache_hits + self.cache_misses
        return {
            "redis_stats": self.cache.get_stats(),
            "cache_hits": self.cache_hits,
            "cache_misses": self.cache_misses,
            "hit_rate": self.cache_hits / total if total > 0 else 0,
        }


# Singleton dùng trong app.py
rag_chatbot = RAGSystem()

# class RAGSystem:
#     def __init__(self):
#         self.embeddings = HuggingFaceEmbeddings(
#             model_name="dangvantuan/vietnamese-embedding"
#         )
#         self.docsearch = QdrantVectorStore.from_existing_collection(
#             embedding=self.embeddings,
#             url=app.config['QDRANT_URL'],
#             api_key=app.config['QDRANT_API_KEY'],
#             collection_name=app.config['COLLECTION_NAME'],
#         )
#         self.retriever = self.docsearch.as_retriever(
#             search_type="similarity",
#             search_kwargs={"k": 40}
#         )
#         self.llm = ChatOpenAI(
#             model=app.config['MODEL_LLM_NAME'],
#             openai_api_key=app.config['OPENAI_API_KEY'],
#             openai_api_base="https://openrouter.ai/api/v1",
#             temperature=0.4,
#             max_tokens=2048
#         )
#
#         self.system_prompt = (
#             "Bạn là một trợ lý tư vấn y tế chuyên nghiệp, "
#             "có nhiệm vụ hỗ trợ và cung cấp thông tin sức khỏe cho người dùng dựa trên **thông tin ngữ cảnh được cung cấp** và **lịch sử hội thoại trước đó**. "
#             "Chỉ sử dụng thông tin trong ngữ cảnh - không được suy đoán hoặc bịa thêm thông tin. "
#             "Nếu ngữ cảnh không chứa thông tin cần thiết, hãy trả lời: "
#             "'Xin lỗi, tôi không có đủ thông tin y khoa để trả lời câu hỏi này.'\n\n"
#
#             "HƯỚNG DẪN TRẢ LỜI:\n"
#             "1. Luôn trả lời bằng **tiếng Việt tự nhiên, rõ ràng, chuyên nghiệp**\n"
#             "2. Tập trung vào các lĩnh vực y tế như: triệu chứng, chẩn đoán, điều trị, phòng ngừa, chăm sóc sức khỏe\n"
#             "3. Trình bày ngắn gọn, dễ hiểu, tối đa 6-8 câu\n"
#             "4. Nếu có thể, đưa ra lời khuyên an toàn và mang tính tham khảo\n"
#             "5. Luôn khuyến nghị người dùng nên tham khảo ý kiến bác sĩ khi cần thiết\n"
#             "6. Không đưa ra chẩn đoán chắc chắn hoặc thay thế hoàn toàn bác sĩ\n\n"
#         )
#
#         # Prompt template không sử dụng memory trong system prompt
#         self.prompt = ChatPromptTemplate.from_messages([
#             ("system", self.system_prompt),
#             MessagesPlaceholder(variable_name="chat_history"),
#             ("human", "{input}")
#         ])
#         # Thêm cache hit counter cho monitoring
#         self.cache_hits = 0
#         self.cache_misses = 0
#
#     def _get_conversation_messages(self, conversation_id):
#         """
#         Lấy lịch sử hội thoại và chuyển đổi sang định dạng LangChain messages
#         """
#         from app.models import ChatMessage
#
#         messages = ChatMessage.query.filter_by(
#             conversation_id=conversation_id
#         ).order_by(ChatMessage.timestamp.asc()).all()
#
#         # Chuyển đổi sang định dạng LangChain messages
#         langchain_messages = []
#         for msg in messages:
#             if msg.message_type == "user":
#                 langchain_messages.append(HumanMessage(content=msg.content))
#             elif msg.message_type == "bot":
#                 langchain_messages.append(AIMessage(content=msg.content))
#
#         return langchain_messages
#
#     # def get_rag_response(self, query, conversation_id):
#     #     """
#     #     Lấy response từ RAG cho 1 conversation_id
#     #     """
#     #     try:
#     #         # 1. Lấy lịch sử chat từ DB cho conversation
#     #         chat_history = self._get_conversation_messages(conversation_id)
#     #
#     #         # 2. Tạo memory đúng cách - KHÔNG truyền chat_history vào constructor
#     #         memory = ConversationBufferMemory(
#     #             memory_key="chat_history",
#     #             return_messages=True
#     #         )
#     #
#     #         # 3. Thêm tin nhắn vào memory thủ công
#     #         for message in chat_history:
#     #             if isinstance(message, HumanMessage):
#     #                 memory.chat_memory.add_user_message(message.content)
#     #             elif isinstance(message, AIMessage):
#     #                 memory.chat_memory.add_ai_message(message.content)
#     #
#     #         # 4. Tạo chain
#     #         question_answer_chain = create_stuff_documents_chain(
#     #             self.llm,
#     #             self.prompt
#     #         )
#     #         rag_chain = create_retrieval_chain(
#     #             self.retriever,
#     #             question_answer_chain
#     #         )
#     #
#     #         # 5. Tạo input với chat_history từ memory
#     #         inputs = {
#     #             "input": query,
#     #             "chat_history": memory.chat_memory.messages
#     #         }
#     #
#     #         # 6. Lấy response
#     #         response = rag_chain.invoke(inputs)
#     #         answer = response.get('answer', 'Xin lỗi, tôi không thể trả lời câu hỏi tài chính này.')
#     #
#     #         return answer
#     #
#     #     except Exception as e:
#     #         app.logger.error(f"RAG System Error: {e}")
#     #         return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu tài chính của bạn. Vui lòng thử lại."
#
#     def get_rag_response(self, query, conversation_id, user_id=None):
#         """
#         Lấy response từ RAG với caching
#         """
#         try:
#             # 1. Kiểm tra cache trước
#             cache_key = f"{user_id}:{conversation_id}:{hash(query)}" if user_id else f"{conversation_id}:{hash(query)}"
#             cached_result = cache.retrieve(query)
#
#             if cached_result:
#                 self.cache_hits += 1
#                 app.logger.info(f"Cache hit for query: {query[:50]}...")
#
#                 # Trả về response từ cache
#                 return cached_result['response']
#
#             self.cache_misses += 1
#
#             # 2. Nếu không có trong cache, xử lý như bình thường
#             # Lấy lịch sử chat từ DB
#             chat_history = self._get_conversation_messages(conversation_id)
#
#             # Tạo memory
#             memory = ConversationBufferMemory(
#                 memory_key="chat_history",
#                 return_messages=True
#             )
#
#             # Thêm tin nhắn vào memory
#             for message in chat_history:
#                 if isinstance(message, HumanMessage):
#                     memory.chat_memory.add_user_message(message.content)
#                 elif isinstance(message, AIMessage):
#                     memory.chat_memory.add_ai_message(message.content)
#
#             # Tạo chain
#             question_answer_chain = create_stuff_documents_chain(
#                 self.llm,
#                 self.prompt
#             )
#             rag_chain = create_retrieval_chain(
#                 self.retriever,
#                 question_answer_chain
#             )
#
#             # Tạo input
#             inputs = {
#                 "input": query,
#                 "chat_history": memory.chat_memory.messages
#             }
#
#             # Lấy response
#             response = rag_chain.invoke(inputs)
#             answer = response.get('answer', 'Xin lỗi, tôi không thể trả lời câu hỏi tài chính này.')
#
#             # 3. Lưu vào cache
#             metadata = {
#                 'conversation_id': conversation_id,
#                 'user_id': user_id,
#                 'query_length': len(query),
#                 'response_length': len(answer),
#                 'model': app.config['MODEL_LLM_NAME'],
#                 'retrieved_docs': len(response.get('context', [])),
#                 'cache_key': cache_key
#             }
#
#             cache.store(
#                 query=query,
#                 response=answer,
#                 conversation_id=conversation_id,
#                 user_id=user_id,
#                 metadata=metadata
#             )
#
#             app.logger.info(f"Cache stored for query: {query[:50]}...")
#
#             return answer
#
#         except Exception as e:
#             app.logger.error(f"RAG System Error: {e}")
#             return "Xin lỗi, có lỗi xảy ra khi xử lý yêu cầu tài chính của bạn. Vui lòng thử lại."
#
#     def get_cache_stats(self):
#         """Lấy thống kê cache"""
#         redis_stats = cache.get_stats()
#         return {
#             'redis_stats': redis_stats,
#             'cache_hits': self.cache_hits,
#             'cache_misses': self.cache_misses,
#             'hit_rate': self.cache_hits / (self.cache_hits + self.cache_misses) if (
#                                                                                                self.cache_hits + self.cache_misses) > 0 else 0
#         }
#
#
# rag_chatbot = RAGSystem()