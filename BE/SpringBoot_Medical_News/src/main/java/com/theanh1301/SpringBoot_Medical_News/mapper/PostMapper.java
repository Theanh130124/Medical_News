package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.SurveyOptionResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.SurveyOption;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface PostMapper {


    @Mapping(target = "user" , ignore = true)
    @Mapping(target = "imagePosts" , ignore = true)
    @Mapping(target = "surveyOptions", expression = "java(mapSurveyOptionStrings(request.getSurveyOptions()))")
    Post toPost(PostCreationRequest request); // tư map từ String -? Enum


    @Mapping(target="id", expression = "java(post.getId().toString())")
    @Mapping(target="imagePostResponses" , source = "imagePosts")
    @Mapping(target = "userResponse" ,source = "user")
    @Mapping(target = "surveyOptions", expression = "java(mapSurveyOptions(post.getSurveyOptions()))")
    PostResponse toPostResponse(Post post);

    @Mapping(target = "imagePosts" , ignore = true)
    void updatePost(@MappingTarget Post post, PostUpdateRequest  request);


    //Map từng SurveyOption sang SurveyOptionResponse
    default List<SurveyOptionResponse> mapSurveyOptions(List<SurveyOption> options) {
        return options == null ? null :
                options.stream()
                        .map(o -> new SurveyOptionResponse(
                                o.getId(),
                                o.getOptionText(),
                                0
                        ))
                        .toList();
    }
    // map từ List<String> → List<SurveyOption> (dùng khi tạo Post)
    default List<SurveyOption> mapSurveyOptionStrings(List<String> optionTexts) {
        if (optionTexts == null) return null;
        return optionTexts.stream()
                .map(text -> SurveyOption.builder()
                        .optionText(text)
                        .build()
                )
                .toList();
    }
}
