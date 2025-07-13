from flask import Flask, jsonify , request
from openai import embeddings
from flask_apscheduler import APScheduler
from src.helper import download_hugging_face_embeddings 
from langchain_pinecone import PineconeVectorStore
from langchain_community.chat_models import ChatOpenAI
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from configs import *

#from langchain_openai import ChatOpenAI

from langchain_core.prompts import ChatPromptTemplate
from src.prompt import *
from store_index import *



app = Flask(__name__)
scheduler = APScheduler()
scheduler.init_app(app)



embeddings = download_hugging_face_embeddings()



docsearch = PineconeVectorStore.from_existing_index(
    index_name=INDEX_NAME,  #nếu mà đã chạy tạo db rồi thì thay bằng "chatbot"
    embedding=embeddings
)

retriever = docsearch.as_retriever(search_type="similarity", search_kwargs={"k":3})  #search_type="similarity tìm kiếm theo cosin  ,  
#as_retrieve biến docsearch thành bộ tìm kiếm , .. k =3 -> tìm 3 giá trị gần nhất


llm = ChatOpenAI(
    model="deepseek/deepseek-r1-distill-llama-70b:free",
    openai_api_key=DEEPSEEK_API_KEY,
    openai_api_base="https://openrouter.ai/api/v1",
    temperature=0.4,
    max_tokens=500
) #độ sáng tạo là 0.4 và số kí tự tối đa là 500

prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        ("human", "{input}")  # dữ liệu vào
    ]
)



question_answer_chain = create_stuff_documents_chain(llm,prompt)
rag_chain = create_retrieval_chain(retriever,question_answer_chain) #retriever -> là các câu trả lời đã lấy ra rồi , quest.... là cách mà chỉ nó trả lời





@app.route('/chat_chatbot',methods=['POST'])
def chat_chatbot():
    data = request.json
    user_input = data.get("msg")
    response = rag_chain.invoke({"input": user_input})
    return jsonify({"answer": response["answer"]})

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


