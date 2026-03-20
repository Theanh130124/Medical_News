package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.InternalMessageItem;
import com.theanh1301.SpringBoot_Medical_News.dto.request.InternalSaveMessagesRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.ChatConversation;
import com.theanh1301.SpringBoot_Medical_News.entity.ChatMessage;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.repository.ChatConversationRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.ChatMessageRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.InternalChatService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InternalChatServiceImpl implements InternalChatService {

    private final ChatConversationRepository conversationRepository;
    private final ChatMessageRepository      messageRepository;
    private final UserRepository             userRepository;

    // ── getHistory ────────────────────────────────────────────────────────────

    @Override
    public List<ChatMessageResponse> getHistory(String conversationId) {
        // Không kiểm tra ownership — Flask đã được trust bằng token
        List<ChatMessage> messages =
                messageRepository.findByConversationIdOrderByTimestampAsc(conversationId);

        return messages.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    // ── saveMessages ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public List<ChatMessageResponse> saveMessages(String conversationId,
                                                  InternalSaveMessagesRequest request) {

        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Conversation not found: " + conversationId));

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found: " + request.getUserId()));

        List<ChatMessage> saved = request.getMessages().stream()
                .map(item -> buildMessage(item, conversation, user))
                .map(messageRepository::save)
                .collect(Collectors.toList());

        // Cập nhật updatedAt của conversation
        conversationRepository.save(conversation);

        return saved.stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ChatMessage buildMessage(InternalMessageItem item,
                                     ChatConversation conversation,
                                     User user) {
        return ChatMessage.builder()
                .conversation(conversation)
                .user(user)
                .content(item.getContent())
                .messageType(item.getMessageType())
                .isHtml(item.getIsHtml() != null ? item.getIsHtml() : false)
                .hasImage(false)
                .build();
    }

    private ChatMessageResponse toResponse(ChatMessage msg) {
        // Điều chỉnh theo ChatMessageResponse DTO hiện có của bạn
        return ChatMessageResponse.builder()
                .id(msg.getId())
                .content(msg.getContent())
                .messageType(msg.getMessageType())
                .timestamp(msg.getTimestamp())
                .isHtml(msg.getIsHtml())
                .hasImage(msg.getHasImage())
                .build();
    }
}