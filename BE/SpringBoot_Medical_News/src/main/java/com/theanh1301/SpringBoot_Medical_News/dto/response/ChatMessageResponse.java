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

    /**
     * Chỉ có giá trị khi sendMessage() được gọi từ FE.
     * FE đọc field này để hiển thị tin nhắn bot ngay lập tức.
     * Các lần load lịch sử sau thì field này null (bot message đã lưu riêng).
     */
    String botResponse;
}