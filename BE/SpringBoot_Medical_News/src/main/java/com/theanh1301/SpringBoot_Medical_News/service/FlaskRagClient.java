package com.theanh1301.SpringBoot_Medical_News.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.Map;

/**
 * Gọi Flask RAG service để lấy câu trả lời từ LLM.
 * Spring Boot đóng vai trò orchestrator (dieu phoi):
 *   1. Nhận request từ FE
 *   2. Gọi Flask RAG → lấy answer
 *   3. Flask tự lưu messages về Spring Boot qua /api/internal
 *   4. Trả answer về FE
 */
@Component
public class FlaskRagClient {

    private final WebClient webClient;

    public FlaskRagClient(
            @Value("${flask.rag.url:http://127.0.0.1:5000}") String flaskUrl
    ) {
        this.webClient = WebClient.builder()
                .baseUrl(flaskUrl)
                .build();
    }



    /**
     * Gọi POST /chat_chatbot trên Flask.
     * Flask sẽ tự lưu cả tin user lẫn bot về Spring Boot qua /api/internal.
     *
     * @return câu trả lời của bot, hoặc fallback nếu Flask lỗi
     */
    public String getAnswer(String userMessage, String conversationId, String userId) {
        try {
            Map<String, String> body = Map.of(
                    "msg",            userMessage,
                    "conversationId", conversationId != null ? conversationId : "",
                    "userId",         userId != null ? userId : ""
            );

            Map response = webClient.post()
                    .uri("/chat_chatbot")
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(300))  // LLM có thể chậm
                    .block();

            if (response != null && response.containsKey("answer")) {
                return response.get("answer").toString();
            }

        } catch (Exception e) {
            System.err.println("[FlaskRagClient] Lỗi gọi Flask: " + e.getMessage());
        }

        return "Xin lỗi, hệ thống đang bận. Vui lòng thử lại sau.";
    }

    public Map<String, Object> getAnswerWithImage(
            String content,
            String conversationId,
            String userId,
            MultipartFile image
    ) {
        MultipartBodyBuilder builder = new MultipartBodyBuilder();

        if (content != null)
            builder.part("content", content);

        builder.part("conversationId", conversationId);
        builder.part("userId", userId);

        if (image != null && !image.isEmpty()) {
            builder.part("image", image.getResource());
        }

        return webClient.post()
                .uri("/chat_chatbot")
                .bodyValue(builder.build())
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}