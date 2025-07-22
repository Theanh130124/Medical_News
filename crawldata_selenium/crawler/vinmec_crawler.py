from selenium import webdriver
from selenium.webdriver.common.by import By
import time
from datetime import datetime

today = datetime.now().strftime("%Y-%m-%d")

BASE_URL = "https://www.vinmec.com"
START_URL = BASE_URL + "/vie/tra-cuu-benh/a/"

driver = webdriver.Chrome()

def crawl_vinmec():
    print("Đang truy cập trang tra cứu bệnh...")
    driver.get("https://www.vinmec.com/vie/benh/")
    time.sleep(3)

    az_links = driver.find_elements(By.CSS_SELECTOR, "div.list_az a")
    letters = [(link.text.strip(), link.get_attribute("href")) for link in az_links]  # A với link
    print(f"Tìm thấy {len(az_links)} chữ cái A-Z")

    all_data = []

    for letter, letter_href in letters:  # A-Z
        print(f"Đang xử lý chữ cái: {letter}")

        page_num = 1
        while True:
            # Tạo URL trang hiện tại
            if page_num == 1:
                page_url = letter_href
            else:
                page_url = f"{letter_href}page_{page_num}"

            driver.get(page_url)
            time.sleep(2)

            try:
                ul = driver.find_element(By.CSS_SELECTOR, 'ul.list_result_AZ.flex')
                li_items = ul.find_elements(By.TAG_NAME, 'li')

                if not li_items:
                    print(f"Không còn bệnh ở trang {page_num} của chữ {letter}")
                    break

                print(f"Tìm thấy {len(li_items)} bệnh ở trang {page_num} chữ {letter}")

                #Lấy tên và link bệnh ở trang hiện tại
                diseases = []
                for li in li_items:
                    disease_name = li.text.strip()
                    disease_href = li.find_element(By.TAG_NAME, 'a').get_attribute('href')
                    diseases.append((disease_name, disease_href))

                #Truy cập từng bệnh
                for disease_name, disease_href in diseases:
                    print(f"  → Bệnh: {disease_name}")
                    driver.get(disease_href)
                    time.sleep(1.5)

                    try:
                        detail_sections = driver.find_elements(By.CLASS_NAME, 'item_detial_sick')  # chi tiết
                        detail_text = ""
                        for item in detail_sections:
                            title = item.find_element(By.CLASS_NAME, 'title_detail_sick').text.strip()
                            content = item.find_element(By.CLASS_NAME, 'body').text.strip()
                            detail_text += f"{title}\n{content}\n\n"
                    except:
                        detail_text = "Không tìm thấy nội dung."

                    all_data.append({
                        "letter": letter,
                        "name": disease_name,
                        "detail": detail_text
                    })

                #Sang trang tiếp theo
                page_num += 1

            except:
                print(f"Không tìm thấy danh sách bệnh ở trang {page_num} chữ {letter}")
                break  # Thoát vòng lặp nếu không còn page

    driver.quit()
    return all_data


if __name__ == "__main__":
    data = crawl_vinmec()
    file_name = f"Data_baiviet_benh_vinmec_{today}.txt"

    with open(file_name, "w", encoding="utf-8") as f:
        for item in data:
            f.write(f"{item['letter']}: {item['name']}\n{item['detail']}\n{'='*80}\n")
    print(f"Crawl xong và lưu dữ liệu vào {file_name}")
