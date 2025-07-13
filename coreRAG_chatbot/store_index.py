from src.helper import *
from pinecone.grpc import PineconeGRPC as Pinecone
from langchain.schema import Document
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
from dotenv import load_dotenv
import os 
from configs import *


load_dotenv()


#Tải model embeddings vietnamess 
embeddings = download_hugging_face_embeddings()

pc = Pinecone(api_key=PINECONE_API_KEY)



def train_new_files():
    #Gọi để gán dữ liệu
    all_docs = load_word_files(data=DATA_FOLDER) 
    new_docs = [] #dữ liệu sẽ đc check 

    #Tiền xử lý dữ liệu
    for doc in all_docs:
        file_name = doc.metadata.get("source", "unknown.docx") #nếu metadata không có thì sẽ tên là unknown.docx -> langchain tự gán (tại vì sẽ không biết tên file sắp train)
        if not is_file_trained(file_name, TRAINED_LOG):  #chưa đc train
            print(f"Phát hiện có file mới và training: {file_name}")
            cleaned_content = preprocess_data(doc.page_content)  #tiền xử lý dữ liệu
            cleaned_doc = Document(
                page_content=cleaned_content,
                metadata=doc.metadata
            )
            new_docs.append(cleaned_doc)
            #đánh dấu đã train 
            mark_file_trained(file_name, TRAINED_LOG)
        else:
            print(f"File đã được train trước đó: {file_name}")
    if not new_docs:
        return "Không có file mới nào để train"
            
    #Tạo chunk 
    text_chunks = text_split(new_docs)
    #Tạo db
    if INDEX_NAME not in pc.list_indexes():
        pc.create_index(
            name=INDEX_NAME,
            dimension=768,
            metric="cosine",
            spec=ServerlessSpec(cloud="aws", region="us-east-1")
        )
    PineconeVectorStore.from_documents(
        documents=text_chunks,
        index_name=INDEX_NAME,
        embedding=embeddings
    )

    
#Chỉ chạy 1 lần đầu tạo db

if __name__ == "__main__":
    result = train_new_files()
    print(result)
    














#Chạy store_index.py để tạo db cho lần đầu 
