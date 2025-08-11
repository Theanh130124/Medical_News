package com.theanh1301.SpringBoot_Medical_News.dto.response;


import com.theanh1301.SpringBoot_Medical_News.enums.FriendStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FriendResponse {

    UserResponse firstUserId;
    UserResponse secondUserId;
    FriendStatus status;
}
