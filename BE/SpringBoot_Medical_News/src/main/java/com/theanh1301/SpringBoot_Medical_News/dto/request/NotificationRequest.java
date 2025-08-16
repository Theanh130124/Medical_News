package com.theanh1301.SpringBoot_Medical_News.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class NotificationRequest {
    String userId;
    String message;
}
