package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.FollowRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FollowResponse;
import com.theanh1301.SpringBoot_Medical_News.service.FollowService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiFollowController {

    FollowService followService;


    //Xem permission


    //Chỉ có followerId đúng mới được làm
//    @PostAuthorize("returnObject.result.followingId.")
    @PostMapping
    public ApiResponse<FollowResponse> follow(@RequestBody FollowRequest request) {
        var res = followService.follow(request);
        return ApiResponse.<FollowResponse>builder().result(res).message("Theo dõi thành công").build();

    }

    //Chỉ có followerId đúng mới được làm
    @DeleteMapping
    public ApiResponse<Void> unfollow(@RequestBody FollowRequest request){
        followService.unfollow(request);
        return ApiResponse.<Void>builder().message("Đã bỏ theo dõi thành công").build();
    }

    //Chỉ có followerId đúng mới được làm
    @GetMapping("/followers/{userId}")
    public ApiResponse<Page<FollowResponse>> getFollowers(@PathVariable String userId , Pageable pageable){
        var res = followService.getFollowers(userId,pageable);
        long count = followService.countFollowers(userId);

        return ApiResponse.<Page<FollowResponse>>builder()
                .result(res)
                .count(count)
                .message("Lấy danh sách số người đang theo dõi thành công").build();

    }

    //Chỉ có followerId đúng mới được làm
    @GetMapping("/following/{userId}")
    public ApiResponse<Page<FollowResponse>> getFollowing(@PathVariable String userId , Pageable pageable){
        var res = followService.getFollowings(userId,pageable);
        long count = followService.countFollowing(userId);
        return ApiResponse.<Page<FollowResponse>>builder()
                .result(res).count(count).message("Lấy danh sách người bạn đang theo dõi thành công").build();

    }

}
