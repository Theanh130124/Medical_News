package com.theanh1301.SpringBoot_Medical_News.controller;

import com.theanh1301.SpringBoot_Medical_News.dto.request.InternalSaveMessagesRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;
import com.theanh1301.SpringBoot_Medical_News.service.InternalChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

/**
 * Endpoint NỘI BỘ — chỉ dành cho Flask RAG service.
 * Xác thực bằng header X-Internal-Token, KHÔNG dùng JWT.
 * Dùng InternalChatService để lưu thẳng vào DB, KHÔNG gọi lại Flask.
 */
@RestController
@RequestMapping("/api/internal")
@RequiredArgsConstructor
public class InternalChatController {

    // Dùng InternalChatService — lưu thẳng DB, không trigger FlaskRagClient
    private final InternalChatService internalChatService;

    @Value("${internal.token}")
    private String internalToken;

    private void verifyToken(String token) {
        if (token == null || !token.equals(internalToken)) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid internal token");
        }
    }

    // ── 1. Lấy lịch sử hội thoại ─────────────────────────────────────────────

    @GetMapping("/conversations/{conversationId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getHistory(
            @PathVariable String conversationId,
            @RequestHeader("X-Internal-Token") String token
    ) {
        verifyToken(token);

        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(internalChatService.getHistory(conversationId))
                .build();
    }

    // ── 2. Lưu tin nhắn user + bot sau khi RAG trả lời ───────────────────────

    @PostMapping("/conversations/{conversationId}/messages")
    public ApiResponse<List<ChatMessageResponse>> saveMessages(
            @PathVariable String conversationId,
            @RequestBody InternalSaveMessagesRequest body,
            @RequestHeader("X-Internal-Token") String token
    ) {
        verifyToken(token);

        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(internalChatService.saveMessages(conversationId, body))
                .message("Lưu tin nhắn thành công")
                .build();
    }
}