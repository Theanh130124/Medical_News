package com.theanh1301.SpringBoot_Medical_News.controller;



import com.theanh1301.SpringBoot_Medical_News.dto.request.ChatMessageRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatConversationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.service.ChatService;
import com.theanh1301.SpringBoot_Medical_News.service.UserService;

import lombok.RequiredArgsConstructor;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ApiChatBotController {

    private final ChatService chatService;
    private final UserService userService;

    //  1. Lấy danh sách conversation
    @GetMapping("/conversations")
    public ApiResponse<List<ChatConversationResponse>> getConversations(Authentication authentication) {

        User user = userService.getUserByUsername(authentication.getName());

        return ApiResponse.<List<ChatConversationResponse>>builder()
                .result(chatService.getUserConversations(user.getId()))
                .build();
    }

    //  2. Tạo conversation
    @PostMapping("/conversations")
    public ApiResponse<ChatConversationResponse> createConversation(
            @RequestBody(required = false) Map<String, String> request,
            Authentication authentication
    ) {

        User user = userService.getUserByUsername(authentication.getName());

        String title = request != null ? request.getOrDefault("title", "Cuộc trò chuyện mới") : "Cuộc trò chuyện mới";

        return ApiResponse.<ChatConversationResponse>builder()
                .result(chatService.createConversation(user.getId(), title))
                .message("Tạo cuộc trò chuyện thành công")
                .build();
    }

    //  3. Lấy messages của 1 conversation
    @GetMapping("/conversations/{conversationId}/messages")
    public ApiResponse<List<ChatMessageResponse>> getMessages(
            @PathVariable String conversationId,
            Authentication authentication
    ) {

        User user = userService.getUserByUsername(authentication.getName());

        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(chatService.getMessagesByConversation(conversationId, user.getId()))
                .build();
    }

    //  4. Gửi message vào conversation
    @PostMapping("/conversations/{conversationId}/messages")
    public ApiResponse<ChatMessageResponse> sendMessage(
            @PathVariable String conversationId,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) MultipartFile image,
            Authentication authentication
    ) {

        User user = userService.getUserByUsername(authentication.getName());

        if ((content == null || content.isBlank()) && (image == null || image.isEmpty())) {
            throw new RuntimeException("Phải nhập nội dung hoặc chọn ảnh");
        }

        ChatMessageRequest request = new ChatMessageRequest();
        request.setContent(content);
        request.setImage(image);
        request.setMessageType("user");

        return ApiResponse.<ChatMessageResponse>builder()
                .result(chatService.sendMessage(conversationId, user.getId(), request))
                .message("Gửi tin nhắn thành công")
                .build();
    }

    //  5. Xoá conversation
    @DeleteMapping("/conversations/{conversationId}")
    public ApiResponse<?> deleteConversation(
            @PathVariable String conversationId,
            Authentication authentication
    ) {

        User user = userService.getUserByUsername(authentication.getName());

        chatService.deleteConversation(conversationId, user.getId());

        return ApiResponse.builder()
                .message("Xoá cuộc trò chuyện thành công")
                .build();
    }


}
