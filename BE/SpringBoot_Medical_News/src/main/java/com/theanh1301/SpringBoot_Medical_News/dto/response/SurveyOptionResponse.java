package com.theanh1301.SpringBoot_Medical_News.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SurveyOptionResponse {

    String id;
    String optionText;
    long voteCount;

    List<UserResponse> userResponses;

}
