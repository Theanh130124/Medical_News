package com.theanh1301.SpringBoot_Medical_News.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {

     String id;
     String content;
     UserResponse userResponse;
     PostResponse postResponse; //maptruct map từ post qua postResponse đc
     Instant createdAt;
     Instant updatedAt;


}
