import os 
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.getenv("PINECONE_API_KEY")
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")
PINECONE_ENV = os.getenv("PINECONE_ENV", "us-east1-gcp")
MODEL_LLM_NAME ="deepseek/deepseek-r1-distill-llama-70b:free"
MODEL_EMBEDING_NAME ="dangvantuan/vietnamese-embedding"
MODEL_CROSS_ENCODER_NAME = "itdainb/PhoRanker"
INDEX_NAME = "medical-chatbot"
DATA_FOLDER = "./DataChatbot/"
TRAINED_LOG = "trained_files.log"  #Nếu đã từng train thì sẽ lưu tên file lại vào đây 