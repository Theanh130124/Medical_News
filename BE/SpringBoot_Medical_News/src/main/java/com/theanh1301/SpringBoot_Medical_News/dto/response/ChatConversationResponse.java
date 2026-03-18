package com.theanh1301.SpringBoot_Medical_News.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatConversationResponse {

    String id;
    String title;
    Instant createdAt;
    Instant updatedAt;

    List<ChatMessageResponse> messages;
}