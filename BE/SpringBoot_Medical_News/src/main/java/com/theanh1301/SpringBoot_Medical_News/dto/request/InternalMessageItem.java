package com.theanh1301.SpringBoot_Medical_News.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InternalMessageItem {

    String content;

    /** "user" hoặc "bot" */
    String messageType;

    Boolean isHtml;
}