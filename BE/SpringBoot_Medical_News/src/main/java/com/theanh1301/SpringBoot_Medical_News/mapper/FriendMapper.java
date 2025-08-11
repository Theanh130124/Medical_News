package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FriendResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Friend;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface FriendMapper {

    @Mapping(target = "firstUserId", source = "firstUser")
    @Mapping(target = "secondUserId", source = "secondUser")
    FriendResponse toFriendResponse(Friend friend);


    Friend toFriend(FriendCreationRequest request);

    void updateFriendFromRequest(FriendUpdateRequest request, @MappingTarget Friend friend);
}
