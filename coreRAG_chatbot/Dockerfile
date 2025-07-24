FROM python:3.10-slim

# Khai báo biến môi trường cache
ENV TRANSFORMERS_CACHE=/tmp/cache

# Tạo thư mục cache và gán toàn quyền (777)
RUN mkdir -p /tmp/cache && chmod -R 777 /tmp/cache

WORKDIR /code
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 7860

# Chạy app
CMD ["python", "app.py"]
