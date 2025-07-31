package com.theanh1301.SpringBoot_Medical_News.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Builder
public class FollowRequest {

    String followerId; //Người thực hiện theo dõi
    String followingId;
}
