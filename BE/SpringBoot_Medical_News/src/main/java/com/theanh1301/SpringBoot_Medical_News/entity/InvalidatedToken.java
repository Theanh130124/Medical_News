package com.theanh1301.SpringBoot_Medical_News.entity;


import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvalidatedToken {
    @Id
    String id; // chinh la jwtId
    Date expiryDate;  // thời hạn -> để có thể quét và xóa di token het han tránh bị phình

}
