import os
from datetime import datetime


today = datetime.now().strftime("%Y-%m-%d")
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_CRAWL_DIR = os.path.join(CURRENT_DIR, "data_crawl")

BASE_VINMEC_URL = "https://www.vinmec.com/vie/benh/"

BASE_YOUMED_URL = "https://youmed.vn/tin-tuc/trieu-chung-benh/"