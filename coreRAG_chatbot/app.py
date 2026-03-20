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
    Body JSON:
        { "msg": "...", "conversationId": "...", "userId": "..." }
    Response:
        { "answer": "...", "cached": true/false }
    """
    data            = request.json or {}
    user_input      = (data.get("msg") or "").strip()
    conversation_id = data.get("conversationId", "")
    user_id         = data.get("userId", "")

    if not user_input:
        return jsonify({"error": "msg không được để trống"}), 400

    answer = rag_chatbot.get_rag_response(
        query=user_input,
        conversation_id=conversation_id,
        user_id=user_id,
    )

    return jsonify({"answer": answer})


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


@app.route('/')
def index():
    return '''
    <h2>Medical Chatbot API</h2>
    <p>App is running!</p>
    <p>Use <code>/chat_chatbot</code> with POST method to interact with the chatbot.</p>
    '''

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