import os
import json
import hashlib
from datetime import datetime
from typing import Optional, Dict, Any
import numpy as np
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()


# Thư mục lưu trữ dữ liệu bộ nhớ đệm -> REDIS
STORAGE_PATH = "./cache/data_store"
os.makedirs(STORAGE_PATH, exist_ok=True)


# Ngưỡng xác định mức độ tương đồng
SIM_THRESHOLD = 0.85

# Mô hình sinh embedding
model_name_emb = "dangvantuan/vietnamese-embedding"
embedder = SentenceTransformer(model_name_emb,token=os.getenv("HF_TOKEN"), trust_remote_code=True)



#Hash querry
def _generate_id(text: str) -> str:
    """Tạo ID duy nhất từ văn bản."""
    content = text.strip().lower().encode("utf-8")
    return hashlib.md5(content).hexdigest()


def _get_vector(text: str) -> np.ndarray:
    """Sinh vector embedding từ văn bản."""
    return embedder.encode(text)



def _similarity_score(vec_a: np.ndarray, vec_b: np.ndarray) -> float:
    """Tính toán độ tương đồng cosine giữa hai vector."""
    return float(np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b)))


def retrieve_from_cache(query: str) -> Optional[Dict[str, Any]]:
    """Tìm kiếm phản hồi từ bộ nhớ đệm, có thể dùng tìm kiếm ngữ nghĩa."""
    query_id = _generate_id(query)
    file_path = os.path.join(STORAGE_PATH, f"{query_id}.json")

    # Kiểm tra khớp tuyệt đối -> theo hash tên file
    if os.path.isfile(file_path):
        with open(file_path, "r") as f:
            return json.load(f)

    # Dò tìm tương đồng ngữ nghĩa -> nếu không có trong cache
    input_vector = _get_vector(query)
    top_match = None
    top_score = 0.0

    for f_name in os.listdir(STORAGE_PATH): #-> đọc và embeddings toàn bộ file trong cache để tìm tương đồng 0.85 -> Redis thì không nên được full . ? hoặc có thể embeddings sẳn ?
        if not f_name.endswith(".json"):
            continue

        file_full_path = os.path.join(STORAGE_PATH, f_name)
        with open(file_full_path, "r") as f:
            try:
                item = json.load(f)
                stored_vector = _get_vector(item.get("prompt", ""))
                score = _similarity_score(input_vector, stored_vector)

                if score >= SIM_THRESHOLD and score > top_score:
                    top_match = item
                    top_score = score
            except Exception:
                continue  # Bỏ qua file lỗi

    return top_match


def store_response(query: str, result: str, extra_info: Optional[Dict[str, Any]] = None) -> None:
    """Lưu kết quả vào bộ nhớ đệm."""
    entry_id = _generate_id(query)
    entry = {
        "prompt": query,
        "response": result,
        "embedding": _get_vector(query).tolist(),
        "timestamp": datetime.utcnow().isoformat(),
        "metadata": extra_info or {}
    }

    with open(os.path.join(STORAGE_PATH, f"{entry_id}.json"), "w") as f:
        json.dump(entry, f, ensure_ascii=False)


def purge_cache() -> None:
    """Xóa toàn bộ bộ nhớ đệm."""
    for f in os.listdir(STORAGE_PATH):
        if f.endswith(".json"):
            os.remove(os.path.join(STORAGE_PATH, f))