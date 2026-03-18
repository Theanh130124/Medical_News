package com.theanh1301.SpringBoot_Medical_News.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {

    String id;
    String content;
    String messageType;
    Instant timestamp;

    Boolean hasImage;
    String imageUrl;
    Boolean isHtml;
}