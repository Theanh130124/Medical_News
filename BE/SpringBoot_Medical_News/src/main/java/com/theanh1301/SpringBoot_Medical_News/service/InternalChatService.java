package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.InternalSaveMessagesRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;

import java.util.List;

public interface InternalChatService {

    /**
     * Lấy toàn bộ tin nhắn trong một conversation (không kiểm tra ownership).
     * Chỉ dùng cho Flask RAG service.
     */
    List<ChatMessageResponse> getHistory(String conversationId);

    /**
     * Lưu batch tin nhắn (user + bot) sau khi RAG trả lời xong.
     */
    List<ChatMessageResponse> saveMessages(String conversationId,
                                           InternalSaveMessagesRequest request);
}