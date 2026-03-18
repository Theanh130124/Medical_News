from flask import Flask, jsonify , request
from openai import embeddings
from flask_apscheduler import APScheduler
from src.helper import download_hugging_face_embeddings 
from langchain_pinecone import PineconeVectorStore
from langchain_openai import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from configs import *
from langchain_core.prompts import ChatPromptTemplate
from src.prompt import *
from store_index import *
from sentence_transformers import CrossEncoder



app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)

embeddings = download_hugging_face_embeddings()
docsearch = PineconeVectorStore.from_existing_index(
    index_name=INDEX_NAME,
    embedding=embeddings
)

retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k":40})  #search_type="similarity tìm kiếm theo cosin 
cross_encoder = CrossEncoder(MODEL_CROSS_ENCODER_NAME)


llm = ChatOpenAI(
    model=MODEL_LLM_NAME,
    openai_api_key=DEEPSEEK_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.4,
    max_tokens=2048
) 
prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}")  # dữ liệu vào
    ]
)


question_answer_chain = create_stuff_documents_chain(llm,prompt)

def rerank_documents(query, docs, top_n=5):
    pairs = [[query, doc.page_content] for doc in docs]
    scores = cross_encoder.predict(pairs)
    reranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
    return [doc for doc, _ in reranked[:top_n]]



@app.route('/chat_chatbot',methods=['POST'])
def chat_chatbot():
    data = request.json
    user_input = data.get("msg")
    #Lấy top - k 
    similar_docs = retriever.invoke(user_input)
    top_docs = rerank_documents(user_input, similar_docs, top_n=5)
    response = question_answer_chain.invoke({
        "input": user_input,
        "context": top_docs
    })

    return jsonify({"answer": response})

@app.route("/train_new_files", methods=["POST"])
def train_api():
    res = train_new_files()
    return jsonify({"status": res})


@scheduler.task('interval', id='train_job',hours=6)
def scheduled_train():
    print("Scheduled training started...")
    train_new_files()

scheduler.start()

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=8080, debug=True)








