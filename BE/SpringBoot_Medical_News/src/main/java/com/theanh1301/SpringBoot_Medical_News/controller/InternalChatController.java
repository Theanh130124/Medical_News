package com.theanh1301.SpringBoot_Medical_News.controller;

import com.theanh1301.SpringBoot_Medical_News.dto.request.ChatMessageRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.InternalSaveMessagesRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;
import com.theanh1301.SpringBoot_Medical_News.service.ChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Endpoint NỘI BỘ — chỉ dành cho Flask RAG service.
 * Xác thực bằng header X-Internal-Token, KHÔNG dùng JWT.
 * Tái sử dụng ChatService có sẵn — không tạo thêm bảng hay service mới.
 */
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalChatController {

    private final ChatService chatService;

    @Value("${internal.token}")
    private String internalToken;

    private void verifyToken(String token) {
        if (token == null || !token.equals(internalToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid internal token");
        }
    }

    // ── 1. Lấy lịch sử hội thoại ─────────────────────────────────────────────

    /**
     * GET /api/internal/conversations/{conversationId}/messages
     * Dùng getMessages() — không kiểm tra ownership, trust Flask bằng token.
     */
    @GetMapping("/conversations/{conversationId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getHistory(
            @PathVariable String conversationId,
            @RequestHeader("X-Internal-Token") String token
    ) {
        verifyToken(token);

        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(chatService.getMessages(conversationId))
                .build();
    }

    // ── 2. Lưu tin nhắn user + bot sau khi RAG trả lời ───────────────────────

    /**
     * POST /api/internal/conversations/{conversationId}/messages
     * Body: { "userId": "...", "messages": [ {content, messageType}, ... ] }
     * Flask gửi gộp cả tin user lẫn bot trong 1 request.
     */
    @PostMapping("/conversations/{conversationId}/messages")
    public ApiResponse<List<ChatMessageResponse>> saveMessages(
            @PathVariable String conversationId,
            @RequestBody InternalSaveMessagesRequest body,
            @RequestHeader("X-Internal-Token") String token
    ) {
        verifyToken(token);

        List<ChatMessageResponse> saved = body.getMessages().stream()
                .map(item -> {
                    ChatMessageRequest req = new ChatMessageRequest();
                    req.setContent(item.getContent());
                    req.setMessageType(item.getMessageType());
                    // image = null vì Flask không gửi ảnh
                    return chatService.sendMessage(conversationId, body.getUserId(), req);
                })
                .collect(Collectors.toList());

        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(saved)
                .message("Lưu tin nhắn thành công")
                .build();
    }
}