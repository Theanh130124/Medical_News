from langchain.document_loaders import DirectoryLoader , UnstructuredWordDocumentLoader 
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
import re
import os



#Load data


def load_word_files(data):
    loader = DirectoryLoader(
        path=data,
        glob="*.docx",
        loader_cls=UnstructuredWordDocumentLoader #loại file cần load   
    )
    documents = loader.load()
    return documents



#Preprocess data
def preprocess_data(text):

    text = re.sub(r'http\S+', '', text)
    #Xoá các ký tự bảng markdown (|, ---)
    text = re.sub(r'\|.*?\|', '', text)
    text = re.sub(r'-{2,}', '', text)
    #Xóa emoji và Unicode không cần thiết
    text = re.sub(r'[^\w\s,.!?à-ỹÀ-Ỹ\-–]', '', text)

    text = re.sub(r'\s+', ' ', text).strip()
    return text
    

#Tách thành các chunk
def text_split(cleaned_data):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=20)
    text_chunks = text_splitter.split_documents(cleaned_data)
    return text_chunks


def download_hugging_face_embeddings():
    embeddings = HuggingFaceEmbeddings(
        model_name="dangvantuan/vietnamese-embedding"
    )
    return embeddings


#Kiểm trả file train chưa
def is_file_trained(file_name,trained_files_log):
    if not os.path.exists(trained_files_log):   # Nếu file log chưa tồn tại
        return False 
    with open(trained_files_log, 'r') as f:
        trained_files = f.read().splitlines()  #lấy ds các tên file đã train
    return file_name in trained_files  #Xem file_name có trong đó không

#Đánh dấu file đã train 
def mark_file_trained(file_name , trained_files_log):
    with open(trained_files_log, 'a') as f: # mở file append
        f.write(f"{file_name}\n")  #ghi tên file vào log khi đã train xong 