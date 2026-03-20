import os
import json
import hashlib
import pickle
import numpy as np
from datetime import datetime
from typing import Optional, Dict, Any, List
from sentence_transformers import SentenceTransformer
import redis
from dotenv import load_dotenv

load_dotenv()


class RedisPromptCache:
    def __init__(self, host="localhost", port=6379, db=0,
                 password=None, prefix="rag_cache:"):
        self.redis_client = redis.Redis(
            host=host,
            port=port,
            db=db,
            password=password,
            decode_responses=False,   # giữ bytes để lưu numpy arrays
        )
        self.prefix = prefix
        self.similarity_threshold = 0.85

        self.embedder = SentenceTransformer(
            "dangvantuan/vietnamese-embedding",
            token=os.getenv("HF_API_KEY"),
            trust_remote_code=True,
        )

        try:
            self.redis_client.ping()
            print("[Cache] Redis connection OK")
        except redis.ConnectionError:
            print("[Cache] WARNING: Cannot connect to Redis")

    # ── Key helpers ───────────────────────────────────────────────────────────

    def _hash_key(self, text: str) -> str:
        h = hashlib.md5(text.strip().lower().encode("utf-8")).hexdigest()
        return f"{self.prefix}hash:{h}"

    def _semantic_key(self, vector_hash: str) -> str:
        return f"{self.prefix}semantic:{vector_hash}"

    def _mapping_key(self, vector_hash: str) -> str:
        return f"{self.prefix}map:{vector_hash}"

    @property
    def _index_key(self) -> str:
        return f"{self.prefix}semantic_index"

    # ── Embedding ─────────────────────────────────────────────────────────────

    def _vectorize(self, text: str) -> np.ndarray:
        return self.embedder.encode(text)

    def _cosine(self, a: np.ndarray, b: np.ndarray) -> float:
        return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))

    # ── Store ─────────────────────────────────────────────────────────────────

    def store(self, query: str, response: str,
              conversation_id: str = None, user_id: str = None,
              metadata: Dict[str, Any] = None) -> str:
        """Lưu query + response vào Redis (exact key + semantic index)."""
        vector       = self._vectorize(query)
        vector_bytes = pickle.dumps(vector)
        vector_hash  = hashlib.md5(vector_bytes).hexdigest()

        entry = {
            "prompt":          query,
            "response":        response,
            "vector_hash":     vector_hash,
            "timestamp":       datetime.utcnow().isoformat(),
            "conversation_id": conversation_id,
            "user_id":         user_id,
            "metadata":        metadata or {},
            "vector":          None,   # vector lưu riêng
        }

        ttl = 86400 * 7   # 7 ngày

        # 1. Lưu entry JSON (không có vector)
        hash_key = self._hash_key(query)
        self.redis_client.set(hash_key, json.dumps(entry, ensure_ascii=False), ex=ttl)

        # 2. Lưu vector bytes riêng
        self.redis_client.set(self._semantic_key(vector_hash), vector_bytes, ex=ttl)

        # 3. Mapping vector_hash → hash_key
        self.redis_client.set(self._mapping_key(vector_hash), hash_key, ex=ttl)

        # 4. Thêm vào semantic index set
        self.redis_client.sadd(self._index_key, vector_hash)

        return hash_key

    # ── Retrieve exact ────────────────────────────────────────────────────────

    def retrieve_exact(self, query: str) -> Optional[Dict[str, Any]]:
        """Tìm kiếm chính xác theo MD5 hash của query."""
        data = self.redis_client.get(self._hash_key(query))
        if not data:
            return None

        entry = json.loads(data)

        # Đính kèm lại vector nếu còn tồn tại
        if entry.get("vector_hash"):
            vbytes = self.redis_client.get(self._semantic_key(entry["vector_hash"]))
            if vbytes:
                entry["vector"] = pickle.loads(vbytes)

        return entry

    # ── Retrieve semantic ─────────────────────────────────────────────────────

    def retrieve_semantic(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Tìm kiếm ngữ nghĩa: so sánh cosine với toàn bộ vector trong index."""
        query_vector = self._vectorize(query)
        results = []

        for vh_bytes in self.redis_client.smembers(self._index_key):
            vector_hash = vh_bytes.decode() if isinstance(vh_bytes, bytes) else vh_bytes

            vbytes = self.redis_client.get(self._semantic_key(vector_hash))
            if not vbytes:
                continue

            similarity = self._cosine(query_vector, pickle.loads(vbytes))
            if similarity < self.similarity_threshold:
                continue

            raw_key = self.redis_client.get(self._mapping_key(vector_hash))
            if not raw_key:
                continue

            data = self.redis_client.get(raw_key)
            if not data:
                continue

            entry = json.loads(data)
            entry["similarity"] = similarity
            results.append(entry)

        results.sort(key=lambda x: x.get("similarity", 0), reverse=True)
        return results[:top_k]

    # ── Retrieve (main) ───────────────────────────────────────────────────────

    def retrieve(self, query: str, use_semantic: bool = True) -> Optional[Dict[str, Any]]:
        """Exact match trước, sau đó semantic nếu không tìm thấy."""
        result = self.retrieve_exact(query)
        if result:
            return result
        if use_semantic:
            hits = self.retrieve_semantic(query, top_k=1)
            return hits[0] if hits else None
        return None

    # ── Delete ────────────────────────────────────────────────────────────────

    def delete_by_query(self, query: str) -> bool:
        """Xóa cache cho một query cụ thể cùng tất cả key liên quan."""
        data = self.redis_client.get(self._hash_key(query))
        if not data:
            return False

        entry       = json.loads(data)
        vector_hash = entry.get("vector_hash")
        keys        = [self._hash_key(query)]

        if vector_hash:
            keys += [self._semantic_key(vector_hash), self._mapping_key(vector_hash)]
            self.redis_client.srem(self._index_key, vector_hash)

        self.redis_client.delete(*keys)
        return True

    def clear_all(self) -> int:
        """Xóa toàn bộ cache theo prefix."""
        keys = self.redis_client.keys(f"{self.prefix}*")
        if keys:
            self.redis_client.delete(*keys)
        return len(keys)

    # ── Stats ─────────────────────────────────────────────────────────────────

    def get_stats(self) -> Dict[str, Any]:
        keys = self.redis_client.keys(f"{self.prefix}*")
        return {
            "total_keys":      len(keys),
            "exact_entries":   sum(1 for k in keys if b"hash:"     in k),
            "semantic_entries": sum(1 for k in keys if b"semantic:" in k),
            "vector_entries":  sum(1 for k in keys if b"map:"      in k),
        }