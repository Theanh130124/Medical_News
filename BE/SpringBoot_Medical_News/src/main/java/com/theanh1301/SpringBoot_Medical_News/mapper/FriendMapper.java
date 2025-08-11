package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FriendResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Friend;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
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


//    Friend toFriend(FriendCreationRequest request);

    void updateFriendFromRequest(FriendUpdateRequest request, @MappingTarget Friend friend);

    //Gặp map(User) -> sẽ map từ String sang user
    // Map User -> String (dùng khi tạo FriendResponse)
    default String map(User user) {
        return user != null ? user.getId() : null;
    }

    // Map String -> User (dùng khi tạo Friend từ request)
    default User map(String id) {
        if (id == null) return null;
        User user = new User();
        user.setId(id);
        return user;
    }

}

