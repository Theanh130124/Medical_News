from flask import Flask, jsonify, request
from flask_apscheduler import APScheduler
from rag_chatbot import rag_chatbot
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/chat_chatbot", methods=["POST"])
def chat_chatbot():
    """
    Hỗ trợ 2 content-type:

    1. multipart/form-data  — Spring Boot gửi lên (text + ảnh tùy chọn)
       Fields khớp ApiChatBotController.sendMessage():
         - content        : nội dung tin nhắn  (@RequestParam "content")
         - conversationId : string
         - userId         : string
         - image          : MultipartFile  (@RequestParam "image")

    2. application/json  — gọi trực tiếp / test
       Body: { "content": "..." hoặc "msg": "...",
               "conversationId": "...", "userId": "..." }

    Response:
       {
         "answer":      "...",
         "xray_result": { "findings": [...], "findings_vi": [...],
                          "scores": {...}, "no_finding": bool } | null
       }
    """
    # ── Parse input ───────────────────────────────────────────────────────────
    ct = request.content_type or ""

    if "multipart/form-data" in ct:
        # Spring Boot gửi @RequestParam — field name là "content"
        user_input = (request.form.get("content")
                      or request.form.get("msg") or "").strip()
        conversation_id = (request.form.get("conversationId")
                           or request.form.get("conversation_id") or "")
        user_id = (request.form.get("userId")
                   or request.form.get("user_id") or "")
        image_file = request.files.get("image")
    else:
        data = request.json or {}
        user_input = (data.get("content")
                      or data.get("msg") or "").strip()
        conversation_id = (data.get("conversationId")
                           or data.get("conversation_id") or "")
        user_id = (data.get("userId")
                   or data.get("user_id") or "")
        image_file = None

    # Cần ít nhất 1 trong 2: text hoặc ảnh
    if not user_input and not image_file:
        return jsonify({"error": "Cần có content hoặc ảnh X-quang"}), 400

    # ── Đọc bytes ảnh (nếu có) ────────────────────────────────────────────────
    image_bytes = None
    image_url = None
    if image_file:
        image_bytes = image_file.read()
        image_url = image_file.filename

    # ── Gọi RAG ───────────────────────────────────────────────────────────────
    result = rag_chatbot.get_rag_response(
        query=user_input,
        conversation_id=conversation_id,
        user_id=user_id,
        image_bytes=image_bytes,
        image_url=image_url,
    )

    return jsonify({
        "answer": result["answer"],
        "xray_result": result.get("xray_result"),
    })

@app.route("/cache/stats", methods=["GET"])
def cache_stats():
    return jsonify(rag_chatbot.get_cache_stats())


@app.route("/cache/clear", methods=["DELETE"])
def cache_clear():
    deleted = rag_chatbot.cache.clear_all()
    return jsonify({"deleted_keys": deleted})


@app.route("/train_new_files", methods=["POST"])
def train_api():
    try:
        from store_index import train_new_files
        res = train_new_files()
        return jsonify({"status": res})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/")
def index():
    return """
    <h2>Medical Chatbot API</h2>
    <p>App is running!</p>
    <ul>
      <li>POST <code>/chat_chatbot</code> — text query (JSON) hoặc text + X-ray image (multipart)</li>
      <li>GET  <code>/cache/stats</code></li>
      <li>POST <code>/train_new_files</code></li>
    </ul>
    """


# ── Scheduler: tự train mỗi 6 tiếng ─────────────────────────────────────────

@scheduler.task("interval", id="train_job", hours=6)
def scheduled_train():
    app.logger.info("Scheduled training started...")
    try:
        from store_index import train_new_files
        train_new_files()
    except Exception as e:
        app.logger.error(f"Scheduled train failed: {e}")


scheduler.start()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)