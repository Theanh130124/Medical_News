package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.service.PostService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiPostController {


    PostService postService;


    @PostMapping
    public ApiResponse<PostResponse> createPost(@ModelAttribute @Valid PostCreationRequest request){
        var res = postService.createPost(request);
        return ApiResponse.<PostResponse>builder().result(res).message("Tạo bài viết thành công").build();
    }

    @PatchMapping("/{postId}")
    public ApiResponse<PostResponse> updatePost(@ModelAttribute @Valid PostUpdateRequest request ,@PathVariable(value="postId") String postId){
        var res = postService.updatePost(postId, request);
        return ApiResponse.<PostResponse>builder().result(res).message("Cập nhật bài viết thành công").build();
    }

}
