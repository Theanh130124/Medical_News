package com.theanh1301.SpringBoot_Medical_News.dto.request;


import com.theanh1301.SpringBoot_Medical_News.entity.ImagePost;
import com.theanh1301.SpringBoot_Medical_News.enums.VisibilityPost;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

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
    String visibility; // -> mapStruct map đc enum
    String type; //-> mapStruct map đc enum
    Boolean allowComments;

    List<String> imagePosts;// tự map


}
