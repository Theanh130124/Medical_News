import os 
from pathlib import Path #đường dẫn với mọi hđh 
import logging



logging.basicConfig(level=logging.INFO, format='[%(asctime)s]: %(message)s:')

list_dir = [
    "src/__init__.py",
    "src/helper.py",
    "src/prompt.py",
    ".env",
    "setup.py",
    "app.py",
    "research/trials.ipynb",

]


for filepath in list_dir:
    filepath = Path(filepath) #Path sẽ đưa đc đg dẫn cho windows , linux ,mac...  -> kiểu đường dẫn tuyệt đối
    filedir , filename = os.path.split(filepath)

    if filedir !="":
        os.makedirs(filedir,exist_ok=True)
        logging.info(f"Đang tạo thư mục:{filedir} với các file: {filename}")

    if (not os.path.exists(filepath) or (os.path.getsize(filepath)==0)):
        with open(filepath , "w") as f:
            pass
            logging.info(f'Đang tạo file {filename}')

    else:
        logging.info(f"{filename} đã tồn tại" )
