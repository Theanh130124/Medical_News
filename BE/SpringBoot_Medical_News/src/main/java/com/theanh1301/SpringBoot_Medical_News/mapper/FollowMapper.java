package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.FollowRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FollowResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Follow;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FollowMapper {

    //id -> chính là entity FollowId
    @Mapping(target = "followerId",source = "follower")
    @Mapping(target = "followingId",source = "following")
    FollowResponse toFollowResponse(Follow follow);

    Follow toFollow(FollowRequest request);
}
