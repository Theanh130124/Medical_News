package com.theanh1301.SpringBoot_Medical_News.dto.response;

import com.theanh1301.SpringBoot_Medical_News.enums.TypeReaction;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class ReactionResponse {


    UserResponse userResponse;
    PostResponse postResponse;
    TypeReaction type;
    Instant createdAt;



}
