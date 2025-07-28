package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ReactionResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Reaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ReactionMapper {


    @Mapping(target = "user" , ignore = true)
    @Mapping(target= "post" , ignore = true)
    Reaction toReaction(ReactionCreationRequest request);

    @Mapping(target="userResponse" , source = "user")
    @Mapping(target="postResponse", source = "post")
    ReactionResponse toReactionResponse(Reaction reaction);

    void updateReaction(@MappingTarget Reaction reaction, ReactionUpdateRequest request);



}
