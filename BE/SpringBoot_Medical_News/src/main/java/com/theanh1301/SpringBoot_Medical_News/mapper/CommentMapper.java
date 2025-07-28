package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Comment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CommentMapper {


    @Mapping(target="post" , ignore = true)
    @Mapping(target ="user" , ignore = true)
    Comment toComment(CommentCreationRequest request);

    @Mapping(target = "userResponse" , source = "user")
    @Mapping(target = "postResponse" , source = "post")
    CommentResponse toCommentResponse(Comment comment);

    void updateComment(@MappingTarget Comment comment, CommentUpdateRequest request);
}
