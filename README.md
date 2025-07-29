# SpringBoot_App

industry project

<h1>SETUP CORE AI</h1>

- Ghi tên file vào trained_file.log khi đã train các file _ lấy các file có tên đánh dấu là đã train

<h2>Anacoda prompt</h2>

```

conda create -n medichatbot python=3.10 -y

conda activate medichatbot

pip install -r requirements.txt

python template.py

add -e .  in requirements.txt  -> nó tìm tập setup.py và chạy

python store_index.py -> create db pine lần đầu

python app.py 



#Chạy cho lần đầu tiên -> python store_index.py

#Chạy mỗi lần để thực hiện gọi đc api -> python app.py 

```

<h1>BE - SPRINGBOOT - SETUP</h1>

```

- run container spring-mysql - từ image mysql-lastest 

- create Application -> for .env 



```

<h1>Setup -Redis</h1>


CMD
```
RUN DOCKER DESKTOP

docker --version 

docker run --name redis-dev -p 6379:6379 -d redis


add pom.xml

<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-data-redis -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
    <version>3.5.3</version>
</dependency>


<!-- https://mvnrepository.com/artifact/org.springframework.boot/spring-boot-starter-cache -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
    <version>3.5.3</version>
</dependency>

Config -> application.properties 

```

![1752468675941](image/README/1752468675941.png)



<h1>Front end -REACTJS(TSX) - SETUP</h1>


```
yarn create react-app medical-news --template typescript

yarn start

```


