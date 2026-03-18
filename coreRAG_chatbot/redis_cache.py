# redis_cache.py
import redis
import json
import hashlib
import numpy as np
from datetime import datetime
from typing import Optional, Dict, Any, List
from sentence_transformers import SentenceTransformer
import pickle
from dotenv import load_dotenv
import os

load_dotenv()


class RedisPromptCache:
    def __init__(self, host='localhost', port=6379, db=0, password=None, prefix="rag_cache:"):
        """
        Khởi tạo Redis cache cho RAG prompts
        """
        self.redis_client = redis.Redis(
            host=host,
            port=port,
            db=db,
            password=password,
            decode_responses=False  # Giữ bytes để lưu numpy arrays
        )
        self.prefix = prefix

        # Mô hình embedding cho semantic search
        self.embedder = SentenceTransformer(
            "dangvantuan/vietnamese-embedding",
            token=os.getenv("HF_API_KEY"),
            trust_remote_code=True
        )

        # Ngưỡng similarity
        self.similarity_threshold = 0.85

        # Test connection
        try:
            self.redis_client.ping()
            print(" Redis connection successful")
        except redis.ConnectionError:
            print(" Cannot connect to Redis")

    def _generate_key(self, text: str) -> str:
        """Tạo Redis key từ text"""
        content_hash = hashlib.md5(text.strip().lower().encode('utf-8')).hexdigest()
        return f"{self.prefix}hash:{content_hash}"

    def _generate_semantic_key(self, vector_hash: str) -> str:
        """Tạo key cho semantic index"""
        return f"{self.prefix}semantic:{vector_hash}"

    def _generate_vector(self, text: str) -> np.ndarray:
        """Tạo embedding vector từ text"""
        return self.embedder.encode(text)

    def _cosine_similarity(self, vec_a: np.ndarray, vec_b: np.ndarray) -> float:
        """Tính cosine similarity"""
        return float(np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b)))

    def store(self, query: str, response: str, conversation_id: int = None,
              user_id: int = None, metadata: Dict[str, Any] = None) -> str:
        """
        Lưu prompt và response vào Redis
        """
        # Tạo embedding vector
        vector = self._generate_vector(query)
        vector_bytes = pickle.dumps(vector)
        vector_hash = hashlib.md5(vector_bytes).hexdigest()

        # Tạo entry data
        entry = {
            'prompt': query,
            'response': response,
            'vector': vector_bytes,
            'vector_hash': vector_hash,
            'timestamp': datetime.utcnow().isoformat(),
            'conversation_id': conversation_id,
            'user_id': user_id,
            'metadata': metadata or {}
        }

        # Chuyển đổi toàn bộ entry thành JSON string (ngoại trừ vector)
        entry_for_json = entry.copy()
        entry_for_json['vector'] = None  # Loại bỏ vector khỏi JSON

        entry_json = json.dumps(entry_for_json, ensure_ascii=False)

        # Lưu vào Redis theo multiple keys
        # 1. Lưu bằng hash key (exact match)
        hash_key = self._generate_key(query)
        self.redis_client.set(hash_key, entry_json, ex=86400 * 7)  # 7 days expiry

        # 2. Lưu vector riêng để semantic search
        semantic_key = self._generate_semantic_key(vector_hash)
        self.redis_client.set(semantic_key, vector_bytes, ex=86400 * 7)

        # 3. Lưu mapping từ vector_hash sang prompt hash
        mapping_key = f"{self.prefix}map:{vector_hash}"
        self.redis_client.set(mapping_key, hash_key, ex=86400 * 7)

        # 4. Thêm vào semantic index set
        index_key = f"{self.prefix}semantic_index"
        self.redis_client.sadd(index_key, vector_hash)

        return hash_key

    def retrieve_exact(self, query: str) -> Optional[Dict[str, Any]]:
        """Tìm kiếm chính xác bằng hash"""
        hash_key = self._generate_key(query)
        cached_data = self.redis_client.get(hash_key)

        if cached_data:
            entry = json.loads(cached_data.decode('utf-8') if isinstance(cached_data, bytes) else cached_data)

            # Lấy lại vector từ separate key
            vector_hash = entry.get('vector_hash')
            if vector_hash:
                semantic_key = self._generate_semantic_key(vector_hash)
                vector_bytes = self.redis_client.get(semantic_key)
                if vector_bytes:
                    entry['vector'] = pickle.loads(vector_bytes)

            return entry
        return None

    def retrieve_semantic(self, query: str, top_k: int = 5) -> List[Dict[str, Any]]:
        """Tìm kiếm semantic với similarity threshold"""
        query_vector = self._generate_vector(query)
        results = []

        # Lấy tất cả vector_hashes từ index
        index_key = f"{self.prefix}semantic_index"
        vector_hashes = self.redis_client.smembers(index_key)

        for vector_hash_bytes in vector_hashes:
            vector_hash = vector_hash_bytes.decode('utf-8') if isinstance(vector_hash_bytes,
                                                                          bytes) else vector_hash_bytes

            # Lấy vector từ Redis
            semantic_key = self._generate_semantic_key(vector_hash)
            vector_bytes = self.redis_client.get(semantic_key)

            if not vector_bytes:
                continue

            cached_vector = pickle.loads(vector_bytes)
            similarity = self._cosine_similarity(query_vector, cached_vector)

            if similarity >= self.similarity_threshold:
                # Lấy metadata từ hash key
                mapping_key = f"{self.prefix}map:{vector_hash}"
                hash_key = self.redis_client.get(mapping_key)

                if hash_key:
                    hash_key = hash_key.decode('utf-8') if isinstance(hash_key, bytes) else hash_key
                    cached_data = self.redis_client.get(hash_key)

                    if cached_data:
                        entry = json.loads(
                            cached_data.decode('utf-8') if isinstance(cached_data, bytes) else cached_data)
                        entry['similarity'] = similarity
                        entry['vector'] = cached_vector
                        results.append(entry)

        # Sắp xếp theo similarity giảm dần
        results.sort(key=lambda x: x.get('similarity', 0), reverse=True)
        return results[:top_k]

    def retrieve(self, query: str, use_semantic: bool = True) -> Optional[Dict[str, Any]]:
        """
        Retrieve cached response - thử exact match trước, sau đó semantic
        """
        # 1. Thử exact match
        exact_result = self.retrieve_exact(query)
        if exact_result:
            return exact_result

        # 2. Nếu không tìm thấy và cho phép semantic search
        if use_semantic:
            semantic_results = self.retrieve_semantic(query, top_k=1)
            if semantic_results:
                return semantic_results[0]

        return None

    def delete_by_query(self, query: str) -> bool:
        """Xóa cache cho một query cụ thể"""
        hash_key = self._generate_key(query)

        # Lấy entry để xóa các key liên quan
        cached_data = self.redis_client.get(hash_key)
        if cached_data:
            entry = json.loads(cached_data.decode('utf-8') if isinstance(cached_data, bytes) else cached_data)
            vector_hash = entry.get('vector_hash')

            # Xóa tất cả các key liên quan
            keys_to_delete = [hash_key]

            if vector_hash:
                keys_to_delete.append(self._generate_semantic_key(vector_hash))
                keys_to_delete.append(f"{self.prefix}map:{vector_hash}")

                # Xóa khỏi semantic index
                index_key = f"{self.prefix}semantic_index"
                self.redis_client.srem(index_key, vector_hash)

            self.redis_client.delete(*keys_to_delete)
            return True

        return False

    def clear_all(self) -> int:
        """Xóa toàn bộ cache"""
        pattern = f"{self.prefix}*"
        keys = self.redis_client.keys(pattern)

        if keys:
            self.redis_client.delete(*keys)
            return len(keys)
        return 0

    def get_stats(self) -> Dict[str, Any]:
        """Lấy thống kê về cache"""
        pattern = f"{self.prefix}*"
        keys = self.redis_client.keys(pattern)

        stats = {
            'total_keys': len(keys),
            'exact_entries': len([k for k in keys if b'hash:' in k]),
            'semantic_entries': len([k for k in keys if b'semantic:' in k]),
            'vector_entries': len([k for k in keys if b'map:' in k]),
        }

        return stats


cache = RedisPromptCache(
    host=os.getenv('REDIS_HOST', 'localhost'),
    port=int(os.getenv('REDIS_PORT', 6379)),
    db=int(os.getenv('REDIS_DB', 0)),
    password=os.getenv('REDIS_PASSWORD', None),
    prefix="rag_prompt_cache:"
)