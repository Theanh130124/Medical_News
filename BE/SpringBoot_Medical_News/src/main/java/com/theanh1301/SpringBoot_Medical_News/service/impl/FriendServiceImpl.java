package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.FriendUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FriendResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Friend;
import com.theanh1301.SpringBoot_Medical_News.entity.FriendId;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.FriendStatus;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.FriendMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.FriendRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.FriendService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FriendServiceImpl implements FriendService {

    FriendRepository friendRepository;
    UserRepository userRepository;
    FriendMapper friendMapper;

    @Override
    public FriendResponse sendRequest(FriendCreationRequest request) {
        if(request.getFirstUser().equals(request.getSecondUser())){
            throw new AppException(ErrorCode.FRIEND_INVALID);
        }
        FriendId id = new FriendId(request.getFirstUser(),request.getSecondUser());
        if(friendRepository.existsById(id)){
            throw new AppException(ErrorCode.FRIEND_ALREADY_EXISTS);
        }
        User firstUser = userRepository.findById(request.getFirstUser())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        User secondUser = userRepository.findById(request.getSecondUser())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        Friend friend = Friend.builder()
                .id(id)
                .firstUser(firstUser)
                .secondUser(secondUser)
                .status(FriendStatus.PENDING)
                .build();
        friendRepository.save(friend);
        return friendMapper.toFriendResponse(friend);
    }

    @Override
    public FriendResponse updateRequest(FriendUpdateRequest request, String firstUserId, String secondUserId) {
        Friend friend = friendRepository.findById(new FriendId(firstUserId, secondUserId))
                .orElseThrow(() -> new AppException(ErrorCode.FRIEND_NOT_FOUND));
        friendMapper.updateFriendFromRequest(request,friend);
        friendRepository.save(friend);

        return friendMapper.toFriendResponse(friend);
    }

    @Override
    public void deleteFriend(String firstUserId, String secondUserId) {
        FriendId id = new FriendId(firstUserId, secondUserId);
        if (!friendRepository.existsById(id)) {
            throw new AppException(ErrorCode.FRIEND_NOT_FOUND);
        }
        friendRepository.deleteById(id);
    }

    @Override
    public Page<FriendResponse> getFriends(String userId, org.springframework.data.domain.Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        return friendRepository.findAllByFirstUserAndStatus(user, FriendStatus.ACCEPTED , pageable)
                .map(friendMapper::toFriendResponse);
    }

    @Override
    public Page<FriendResponse> getPendingRequests(String userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        return friendRepository.findAllBySecondUserAndStatus(user, FriendStatus.PENDING, pageable)
                .map(friendMapper::toFriendResponse);
    }



    @Override
    public boolean canAccessFriend(Page<FriendResponse> page, String currentUser) {
        return page.stream().allMatch(friend -> friend.getSecondUserId().getUsername().equals(currentUser));
    }

    @Override
    public boolean canAccessListFriend(Page<FriendResponse> page, String currentUser) {
        return page.stream().allMatch(friend -> friend.getFirstUserId().getUsername().equals(currentUser));
    }

    @Override
    public FriendResponse getFriendResponseById(String firstUserId, String secondUserId) {
        FriendId friendId = new FriendId(firstUserId, secondUserId);
        Friend friend = friendRepository.findById(friendId)
                .orElseThrow(() -> new AppException(ErrorCode.FRIEND_NOT_FOUND));
        return friendMapper.toFriendResponse(friend);
    }

    @Override
    public List<String> getFriendIds(String userId) {
        List<Friend> friends = friendRepository.findAcceptedFriends(userId);
        return friends.stream()
                .map(f -> f.getFirstUser().getId().equals(userId)
                        ? f.getSecondUser().getId()
                        : f.getFirstUser().getId())
                .toList();
    }
}
