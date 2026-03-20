package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.theanh1301.SpringBoot_Medical_News.dto.request.ChatMessageRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatConversationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.*;
import com.theanh1301.SpringBoot_Medical_News.mapper.ChatMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.*;
import com.theanh1301.SpringBoot_Medical_News.service.ChatService;
import com.theanh1301.SpringBoot_Medical_News.service.FlaskRagClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ChatServiceImpl implements ChatService {

    private final ChatConversationRepository conversationRepo;
    private final ChatMessageRepository      messageRepo;
    private final UserRepository             userRepo;
    private final ChatMapper                 chatMapper;
    private final Cloudinary                 cloudinary;
    private final FlaskRagClient             flaskRagClient;   // inject RAG client

    @Override
    public ChatConversationResponse createConversation(String userId, String title) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        ChatConversation conversation = ChatConversation.builder()
                .user(user)
                .title(title != null ? title : "Cuộc trò chuyện mới")
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .build();

        return chatMapper.toConversationResponse(conversationRepo.save(conversation));
    }

    @Override
    public List<ChatConversationResponse> getUserConversations(String userId) {
        return conversationRepo.findByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(chatMapper::toConversationResponse)
                .toList();
    }

    @Override
    public List<ChatMessageResponse> getMessagesByConversation(String conversationId, String userId) {
        ChatConversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation không tồn tại"));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền truy cập");
        }

        return messageRepo.findByConversationIdOrderByTimestampAsc(conversationId)
                .stream()
                .map(chatMapper::toMessageResponse)
                .toList();
    }

    @Override
    public void deleteConversation(String conversationId, String userId) {
        ChatConversation conversation = conversationRepo.findById(conversationId)
                .orElseThrow(() -> new RuntimeException("Conversation không tồn tại"));

        if (!conversation.getUser().getId().equals(userId)) {
            throw new RuntimeException("Không có quyền xoá");
        }

        conversationRepo.delete(conversation);
    }

    /**
     * Luồng xử lý:
     * 1. Upload ảnh nếu có (Cloudinary)
     * 2. Gọi Flask RAG → lấy botAnswer
     *    (Flask tự lưu cả tin user + bot về /api/internal)
     * 3. Trả về ChatMessageResponse kèm botResponse cho FE
     *
     * Lưu ý: Flask đã lưu messages vào DB qua InternalChatController,
     * nên ở đây KHÔNG lưu lại để tránh duplicate.
     */
    @Override
    public ChatMessageResponse sendMessage(String conversationId, String userId,
                                           ChatMessageRequest request) {

        conversationRepo.findById(conversationId).orElseThrow(
                () -> new RuntimeException("Conversation không tồn tại"));
        userRepo.findById(userId).orElseThrow(
                () -> new RuntimeException("User không tồn tại"));

        // 1. Upload ảnh nếu có
        String imageUrl = null;
        boolean hasImage = false;

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(
                        request.getImage().getBytes(),
                        ObjectUtils.asMap("resource_type", "auto")
                );
                imageUrl = res.get("secure_url").toString();
                hasImage = true;
            } catch (IOException e) {
                throw new RuntimeException("Upload image failed");
            }
        }

        // 2. Gọi Flask RAG — Flask sẽ tự lưu user + bot message về DB
        String botAnswer = flaskRagClient.getAnswer(
                request.getContent(),
                conversationId,
                userId
        );

        // 3. Trả về response cho FE
        // Dùng builder tạm — không save vào DB ở đây vì Flask đã lưu rồi
        return ChatMessageResponse.builder()
                .content(request.getContent())
                .messageType("user")
                .hasImage(hasImage)
                .imageUrl(imageUrl)
                .timestamp(Instant.now())
                .botResponse(botAnswer)   // FE đọc field này để hiển thị tin bot
                .build();
    }

    @Override
    public List<ChatMessageResponse> getMessages(String conversationId) {
        return messageRepo.findByConversationIdOrderByTimestampAsc(conversationId)
                .stream()
                .map(chatMapper::toMessageResponse)
                .toList();
    }
}