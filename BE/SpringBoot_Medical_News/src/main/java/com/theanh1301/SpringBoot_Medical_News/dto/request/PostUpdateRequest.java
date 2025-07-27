package com.theanh1301.SpringBoot_Medical_News.dto.request;


import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class PostUpdateRequest {

    String title;
    String content;
    String visibility;
    Boolean allowComments;
    List<MultipartFile> imagePosts;
}
