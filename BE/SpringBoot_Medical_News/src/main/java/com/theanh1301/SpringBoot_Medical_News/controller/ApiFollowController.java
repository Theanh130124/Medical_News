package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.FollowRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.FollowResponse;
import com.theanh1301.SpringBoot_Medical_News.service.FollowService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiFollowController {

    FollowService followService;
    PaginationProperties paginationProperties;


    //Xem permission


    //Chỉ có followerId đúng mới được làm
    @PostAuthorize("returnObject.result.followerId.username == authentication.name")
    @PostMapping
    public ApiResponse<FollowResponse> follow(@RequestBody FollowRequest request) {
        var res = followService.follow(request);
        return ApiResponse.<FollowResponse>builder().result(res).message("Theo dõi thành công").build();

    }
    //Delete dùng @Pre vì sao xóa mất @Post k lấy được
    //Chỉ có followerId đúng mới được làm
    @PreAuthorize("@followServiceImpl.getFollowResponseById(#request.followerId,#request.followingId).followerId.username == authentication.name")
    @DeleteMapping
    public ApiResponse<Void> unfollow(@RequestBody FollowRequest request){
        followService.unfollow(request);
        return ApiResponse.<Void>builder().message("Đã bỏ theo dõi thành công").build();
    }

    //Chỉ có followerId đúng mới được làm
    @PostAuthorize("@followServiceImpl.canAccessAllFollower(returnObject.result, authentication.name)")
    @GetMapping("/followers/{userId}")
    public ApiResponse<Page<FollowResponse>> getFollowers(@PathVariable String userId , @RequestParam(required = false) Integer size,
                                                          @RequestParam(required = false) Integer page){

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        var res = followService.getFollowers(userId,pageable);
        long count = followService.countFollowers(userId);

        return ApiResponse.<Page<FollowResponse>>builder()
                .result(res)
                .count(count)
                .message("Lấy danh sách số người đang theo dõi thành công").build();

    }

    //Chỉ có followerId đúng mới được làm
    @PostAuthorize("@followServiceImpl.canAccessAllFollowing(returnObject.result, authentication.name)")
    @GetMapping("/following/{userId}")
    public ApiResponse<Page<FollowResponse>> getFollowing(@PathVariable String userId , @RequestParam(required = false) Integer size,
                                                          @RequestParam(required = false) Integer page){

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        var res = followService.getFollowings(userId,pageable);
        long count = followService.countFollowing(userId);
        return ApiResponse.<Page<FollowResponse>>builder()
                .result(res).count(count).message("Lấy danh sách người bạn đang theo dõi thành công").build();

    }

}
