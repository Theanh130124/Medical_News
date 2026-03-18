package com.theanh1301.SpringBoot_Medical_News.mapper;

import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatConversationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ChatMessageResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.ChatConversation;
import com.theanh1301.SpringBoot_Medical_News.entity.ChatMessage;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface ChatMapper {

    ChatConversationResponse toConversationResponse(ChatConversation conversation);

    ChatMessageResponse toMessageResponse(ChatMessage message);

    List<ChatMessageResponse> toMessageResponses(List<ChatMessage> messages);
}