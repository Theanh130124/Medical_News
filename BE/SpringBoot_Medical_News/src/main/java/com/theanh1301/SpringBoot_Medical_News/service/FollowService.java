package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.FollowRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FollowResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface FollowService {

    FollowResponse follow(FollowRequest request);

    void unfollow(FollowRequest request);

    Page<FollowResponse> getFollowers(String userId, Pageable pageable);

    Page<FollowResponse> getFollowings(String userId, Pageable pageable);

    FollowResponse getFollowResponseById(String followerId , String followingId);

    boolean canAccessAllFollower(Page<FollowResponse> page, String currentUser);

    boolean canAccessAllFollowing(Page<FollowResponse> page, String currentUser);

    long countFollowers(String userId);

    long countFollowing(String userId);

    boolean isFollowing(String followerId, String followingId);
}
