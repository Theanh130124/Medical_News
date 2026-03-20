from src.helper import (
    download_hugging_face_embeddings,
    load_word_files,
    preprocess_data,
    text_split,
    is_file_trained,
    mark_file_trained,
)
from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from dotenv import load_dotenv
import os

load_dotenv()

# ── Cấu hình ──────────────────────────────────────────────────────────────────
QDRANT_URL      = os.getenv("QDRANT_URL")
QDRANT_API_KEY  = os.getenv("QDRANT_API_KEY")
COLLECTION_NAME = os.getenv("COLLECTION_NAME", "medical")
DATA_FOLDER     = os.getenv("DATA_FOLDER")
TRAINED_LOG     = os.getenv("TRAINED_LOG")

# dangvantuan/vietnamese-embedding output dimension = 768
VECTOR_DIM = 768

# ── Khởi tạo ──────────────────────────────────────────────────────────────────
embeddings = download_hugging_face_embeddings()

client = QdrantClient(
    url=QDRANT_URL,
    api_key=QDRANT_API_KEY,
)


def _ensure_collection():
    """Tạo collection nếu chưa tồn tại."""
    existing = [c.name for c in client.get_collections().collections]
    if COLLECTION_NAME not in existing:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(size=VECTOR_DIM, distance=Distance.COSINE),
        )
        print(f"[Qdrant] Đã tạo collection: {COLLECTION_NAME}")
    else:
        print(f"[Qdrant] Collection đã tồn tại: {COLLECTION_NAME}")


def train_new_files():
    all_docs = load_word_files(data=DATA_FOLDER)
    new_docs = []

    for doc in all_docs:
        file_name = doc.metadata.get("source", "unknown.txt")

        if not is_file_trained(file_name, TRAINED_LOG):
            print(f"[Train] Phát hiện file mới: {file_name}")
            cleaned = preprocess_data(doc.page_content)
            new_docs.append(Document(page_content=cleaned, metadata=doc.metadata))
            mark_file_trained(file_name, TRAINED_LOG)
        else:
            print(f"[Train] Đã train trước đó: {file_name}")

    if not new_docs:
        return "Không có file mới nào để train"

    # Chunk
    text_chunks = text_split(new_docs)
    print(f"[Train] Tổng số chunks: {len(text_chunks)}")

    # Đảm bảo collection tồn tại trước khi upsert
    _ensure_collection()

    # Upsert vào Qdrant
    QdrantVectorStore.from_documents(
        documents=text_chunks,
        embedding=embeddings,
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=COLLECTION_NAME,
    )

    return f"Train xong {len(text_chunks)} chunks từ {len(new_docs)} file mới"


# Chạy lần đầu để tạo DB
if __name__ == "__main__":
    result = train_new_files()
    print(result)