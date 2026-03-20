package com.theanh1301.SpringBoot_Medical_News.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InternalSaveMessagesRequest {

    /** ID của user đang chat (gửi từ Flask) */
    String userId;

    /** Danh sách tin nhắn cần lưu (thường gồm 1 user + 1 bot) */
    List<InternalMessageItem> messages;
}