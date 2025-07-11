from src.helper import load_word_files , download_hugging_face_embeddings , text_split , preprocess_data 
from pinecone.grpc import PineconeGRPC as Pinecone
from langchain.schema import Document
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from dotenv import load_dotenv
import os 


load_dotenv()


PINECONE_API_KEY=os.environ.get('PINECONE_API_KEY')
os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY 

#Tải model embeddings vietnamess 
embeddings = download_hugging_face_embeddings()

#Gọi để gán dữ liệu
extracted_data = load_word_files(data='DataChatbot/')

#Tiền xử lý dữ liệu
cleaned_data = []
for doc in extracted_data:
    cleaned_content = preprocess_data(doc.page_content)
    cleaned_doc = Document(
        page_content=cleaned_content,
        metadata=doc.metadata 
    )
    cleaned_data.append(cleaned_doc)

#Tạo chunk 
text_chunks = text_split(cleaned_data)


pc = Pinecone(api_key=PINECONE_API_KEY) 
index_name = "medical-chatbot"

pc.create_index(
    name=index_name,  #ten db
    dimension=768,   #Số chiều vector theo docs 
    metric="cosine",   #So sánh theo vector theo cosin 
    spec=ServerlessSpec(
        cloud="aws",
        region="us-east-1"
    )
)

docsearch = PineconeVectorStore.from_documents(
    documents=text_chunks, # data đã clean và tách chunk
    index_name=index_name, 
    embedding=embeddings, #mô hình dangvantuan/vietnamese-embedding
)



#Chạy store_index.py để tạo db cho lần đầu 
