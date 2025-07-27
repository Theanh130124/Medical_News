package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PostMapper {


    @Mapping(target = "user" , ignore = true)
    @Mapping(target = "imagePosts" , ignore = true)
    Post toPost(PostCreationRequest request); // tư map từ String -? Enum

    @Mapping(target="imagePostResponses" , ignore = true)
    @Mapping(target = "userResponse" ,ignore = true)
    PostResponse toPostResponse(Post post);
}
