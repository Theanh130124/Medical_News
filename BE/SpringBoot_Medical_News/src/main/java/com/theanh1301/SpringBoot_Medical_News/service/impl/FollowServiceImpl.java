package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.theanh1301.SpringBoot_Medical_News.dto.request.FollowRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FollowResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Follow;
import com.theanh1301.SpringBoot_Medical_News.entity.FollowId;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.FollowMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.FollowRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.FollowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FollowServiceImpl implements FollowService {

    FollowRepository followRepository;
    UserRepository userRepository;
    FollowMapper followMapper;

    @Override
    public FollowResponse follow(FollowRequest request) {
        if (request.getFollowerId().equals(request.getFollowingId())) {
            throw new AppException(ErrorCode.FOLLOW_INVALID);
        }
        //Id của follow
        FollowId followId = new FollowId(request.getFollowerId(), request.getFollowingId());
        if(followRepository.existsById(followId)){
            throw new AppException(ErrorCode.FOLLOW_ALREADY);
        }
        User follower = userRepository
                .findById(request.getFollowerId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        User following = userRepository.findById(request.getFollowingId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        Follow follow = Follow.builder()
                .id(followId)
                .follower(follower)
                .following(following)
                .build();
        followRepository.save(follow);
        return followMapper.toFollowResponse(follow);
    }

    @Override
    public void unfollow(FollowRequest request) {
        FollowId followId = new FollowId(request.getFollowerId(), request.getFollowingId());

        //Chưa follow
        if(!followRepository.existsById(followId)){
            throw new AppException(ErrorCode.FOLLOW_NOT_FOUND);
        }
        followRepository.deleteById(followId);
    }

    //Đang được theo dõi
    //Đếm tổng số lần xuất hiện trong của follower trong following
    @Override
    public Page<FollowResponse> getFollowers(String userId, Pageable pageable) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        return followRepository.findAllByFollowing(user,pageable).map(followMapper::toFollowResponse);
    }

    //Đang theo dõi
    @Override
    public Page<FollowResponse> getFollowings(String userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        return followRepository.findAllByFollower(user, pageable)
                .map(followMapper::toFollowResponse);
    }

    @Override
    public long countFollowers(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        return followRepository.countFollowers(user);
    }

    @Override
    public long countFollowing(String userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        return followRepository.countFollowing(user);
    }

    //phải là 2 cái á
    @Override
    public FollowResponse getFollowResponseById(String followerId, String followingId) {
        FollowId followId = new FollowId(followerId, followingId);
        return followMapper.toFollowResponse(followRepository.findById(followId).orElseThrow(() -> new AppException(ErrorCode.FOLLOW_NOT_FOUND)));
    }

    //So sánh trong page
    @Override
    public boolean canAccessAllFollower(Page<FollowResponse> page, String currentUser) {
        return page.stream().allMatch(follow -> follow.getFollowingId().getUsername().equals(currentUser));
    }

    @Override
    public boolean canAccessAllFollowing(Page<FollowResponse> page, String currentUser) {
        return page.stream().allMatch(follow -> follow.getFollowerId().getUsername().equals(currentUser));
    }






}
