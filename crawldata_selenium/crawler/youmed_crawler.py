from selenium import webdriver
from selenium.webdriver.common.by import By
import time

from crawler.config import *


driver = webdriver.Chrome()


def crawl_youmed():
    print("Đang truy cập vào YouMed")
    driver.get(BASE_YOUMED_URL)
    time.sleep(3)

    disease = driver.find_elements(By.CSS_SELECTOR, ".items-outer li a") #Từng bệnh
    letters = [(link.text.strip() , link.get_attribute("href")) for link in disease]
    print(f"Tìm thấy {len(letters)} link bệnh")

    all_data = []
    for disease_name , disease_href in letters:
        print(f"Đang xử lý bệnh: {disease_name}")
        driver.get(disease_href)
        time.sleep(2)
        try:

            content = driver.find_element(
                By.CSS_SELECTOR, '.prose.max-w-none.my-4.prose-a\\:text-primary'
            )
            try:
                toc_container = content.find_element(By.CSS_SELECTOR, "#ez-toc-container")
                driver.execute_script("""
                                    let toc = arguments[0];
                                    toc.parentNode.removeChild(toc);
                                """, toc_container)
                print("Đã loại bỏ ez-toc-container")
            except:
                print("Không có ez-toc-container")
                pass
            elements = content.find_elements(By.CSS_SELECTOR, "h2, h3, p, li")
            disease_text = []
            for el in elements:
                text = el.text.strip()
                if text:
                    disease_text.append(text)
            all_data.append({
                "name": disease_name,
                "url": disease_href,
                "content": disease_text
            })
            print(f"Đã lấy xong: {disease_name}")
        except Exception as e:

            print(f"Lỗi khi xử lý {disease_name}: {e}")
    print(f"Đã crawl xong {len(all_data)} bệnh")
    return all_data

if __name__ == "__main__":
    data = crawl_youmed()
    file_name = f"Data_baiviet_benh_youmed_{today}.txt"
    file_path = os.path.join(DATA_CRAWL_DIR, file_name)

    with open(file_path, "w", encoding="utf-8") as f:
        for item in data:
            f.write(f"{item['name']}\n{item['url']}\n")
            f.write("\n".join(item['content']) + "\n")
            f.write("=" * 80 + "\n")
    print(f"Crawl xong và lưu dữ liệu vào {file_name}")
