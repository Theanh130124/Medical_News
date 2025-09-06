package com.theanh1301.SpringBoot_Medical_News.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SearchHistoryResponse {
    String id;
    String keyword;
    LocalDateTime searchTime;

}