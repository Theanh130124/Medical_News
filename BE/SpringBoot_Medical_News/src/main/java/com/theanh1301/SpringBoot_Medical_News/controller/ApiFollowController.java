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
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiFollowController {

    FollowService followService;

    @PostMapping
    public ApiResponse<FollowResponse> follow(@RequestBody FollowRequest request) {
        var res = followService.follow(request);
        return ApiResponse.<FollowResponse>builder().result(res).message("Theo dõi thành công").build();

    }

    @DeleteMapping
    public ApiResponse<Void> unfollow(@RequestBody FollowRequest request){
        followService.unfollow(request);
        return ApiResponse.<Void>builder().message("Đã bỏ theo dõi thành công").build();
    }

    @GetMapping("/follwers/{userId}")
    public ApiResponse<Page<FollowResponse>> getFollowers(@PathVariable String userId , Pageable pageable){
        //Thêm count nữa

    }

}
