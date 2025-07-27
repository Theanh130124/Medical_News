package com.theanh1301.SpringBoot_Medical_News.dto.response;



import com.theanh1301.SpringBoot_Medical_News.enums.TypePost;
import com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class PostResponse {

    UserResponse userResponse; // tự map
    String title;
    String content;
    VisibilityPost visibility;
    TypePost type;
    Boolean allowComments;
    Instant createdAt;
    Instant updatedAt;




}
