package com.theanh1301.SpringBoot_Medical_News.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationRequest {
    String userId; // Không bắt buộc nếu gửi hàng loạt

    @NotBlank(message = "Message là bắt buộc")
    String message;

    String targetType; // Thêm trường để xác định đối tượng gửi
}