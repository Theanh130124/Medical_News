package com.theanh1301.SpringBoot_Medical_News.dto.request;


import com.theanh1301.SpringBoot_Medical_News.entity.ImagePost;
import com.theanh1301.SpringBoot_Medical_News.enums.TypePost;
import com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level= AccessLevel.PRIVATE)
public class PostCreationRequest {

    String userId; // tự map
    String title;
    String content;
    String visibility; // -> mapStruct map đc enum (Nhưng truyền đúng tên)
    TypePost type; //-> mapStruct map đc enum
    Boolean allowComments;

    List<MultipartFile> imagePosts;// tự map

    //Nếu type = SURVEY
    List<String> surveyOptions;


}
