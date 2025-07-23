from langchain_community.document_loaders import DirectoryLoader, UnstructuredWordDocumentLoader , TextLoader #Đã update 
from langchain_huggingface import HuggingFaceEmbeddings # Đã update
from langchain.text_splitter import RecursiveCharacterTextSplitter
import re
import os



#Load data


def load_word_files(data):
    loader = DirectoryLoader(
        path=data,
        glob="*.txt",
        loader_cls=lambda path: TextLoader(path, encoding='utf-8') #loại file cần load   
    )
    documents = loader.load()
    return documents



#Preprocess data
def preprocess_data(text):

    
    #Xóa URL
    text = re.sub(r'(https?://\S+|www\.\S+)', '', text)
    # Xoá các dòng chỉ chứa dấu = hoặc -
    text = re.sub(r'^[=\-]{2,}\s*$', '', text, flags=re.MULTILINE)
    #Xoá các ký tự bảng markdown (|, ---)
    text = re.sub(r'\|.*?\|', '', text)
    # Xoá emoji và ký tự Unicode không cần thiết
    text = re.sub(r'[^\w\s,.!?à-ỹÀ-Ỹ\-–]', '', text)
    # Xoá khoảng trắng thừa và dòng trống
    text = re.sub(r'\s+', ' ', text).strip()
    return text
    

#Tách thành các chunk
def text_split(cleaned_data):
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=512, chunk_overlap=20)
    text_chunks = text_splitter.split_documents(cleaned_data)
    return text_chunks


def download_hugging_face_embeddings():
    embeddings = HuggingFaceEmbeddings(
        model_name="dangvantuan/vietnamese-embedding"
    )
    return embeddings




#n8n

#Kiểm trả file train chưa
def is_file_trained(file_name,trained_files_log):
    if not os.path.exists(trained_files_log):   # Nếu file log chưa tồn tại
        return False 
    with open(trained_files_log, 'r' ,encoding='utf-8') as f:
        trained_files = f.read().splitlines()  #lấy ds các tên file đã train
    return file_name in trained_files  #Xem file_name có trong đó không

#Đánh dấu file đã train 
def mark_file_trained(file_name , trained_files_log):
    with open(trained_files_log, 'a', encoding='utf-8') as f: # mở file append
        f.write(f"{file_name}\n")  #ghi tên file vào log khi đã train xong 