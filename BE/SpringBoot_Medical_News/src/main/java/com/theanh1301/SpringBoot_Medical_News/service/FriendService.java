package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FriendResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Friend;
import com.theanh1301.SpringBoot_Medical_News.repository.FriendRepository;
import org.mapstruct.MappingTarget;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FriendService {

    FriendResponse sendRequest(FriendCreationRequest request);
    FriendResponse updateRequest(FriendUpdateRequest request, String firstUserId, String secondUserId);
    void deleteFriend(String firstUserId, String secondUserId);
    Page<FriendResponse> getFriends(String userId, Pageable pageable);
    Page<FriendResponse> getPendingRequests(String userId, Pageable pageable);
    FriendResponse getFriendResponseById(String firstUserId, String secondUserId);
    boolean canAccessFriend(Page<FriendResponse> page, String currentUser);

}
