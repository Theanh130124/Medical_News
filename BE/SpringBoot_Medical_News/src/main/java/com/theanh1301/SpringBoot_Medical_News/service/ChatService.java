package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.ChatMessageRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatConversationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;

import java.util.List;

public interface ChatService {



    List<ChatConversationResponse> getUserConversations(String userId);

    ChatConversationResponse createConversation(String userId, String title);

    List<ChatMessageResponse> getMessagesByConversation(String conversationId, String userId);

    ChatMessageResponse sendMessage(String conversationId, String userId, ChatMessageRequest request);

    List<ChatMessageResponse> getMessages(String conversationId);

    void deleteConversation(String conversationId, String userId);
}