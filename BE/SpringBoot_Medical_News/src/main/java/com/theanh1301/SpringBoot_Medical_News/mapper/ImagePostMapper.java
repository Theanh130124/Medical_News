package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.response.ImagePostResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.ImagePost;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import org.mapstruct.Mapper;

import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ImagePostMapper {


    ImagePostResponse toImagePostResponse(ImagePost imagePost);

    List<ImagePostResponse> toImagePostResponse(List<ImagePost> imagePost);

}
