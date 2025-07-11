from langchain.document_loaders import DirectoryLoader , UnstructuredWordDocumentLoader 
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
import re
from dotenv import load_dotenv
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
