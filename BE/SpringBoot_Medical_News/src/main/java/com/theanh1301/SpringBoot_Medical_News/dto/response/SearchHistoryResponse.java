package com.theanh1301.SpringBoot_Medical_News.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchHistoryResponse {

    UserResponse user;
    String keyword;
    Instant searchedAt;

}
