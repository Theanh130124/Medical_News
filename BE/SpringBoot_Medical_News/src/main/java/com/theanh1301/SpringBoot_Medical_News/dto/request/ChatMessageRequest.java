package com.theanh1301.SpringBoot_Medical_News.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageRequest {

    String content;

    MultipartFile image; // giống avatar

    String messageType; // "user" hoặc "bot"
}