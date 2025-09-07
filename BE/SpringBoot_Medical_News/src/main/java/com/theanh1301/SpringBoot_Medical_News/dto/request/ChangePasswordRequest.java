package com.theanh1301.SpringBoot_Medical_News.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChangePasswordRequest {

    @NotBlank
    String oldPassword;

    @NotBlank
    @Size(min = 8, max = 30, message = "PASSWORD_INVALID")
    String newPassword;

    @NotBlank
    String confirmPassword;
}