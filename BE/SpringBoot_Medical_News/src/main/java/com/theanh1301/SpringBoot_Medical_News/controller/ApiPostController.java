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
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiPostController {


    PostService postService;
    private final RestClient.Builder builder;


    @PostMapping
    public ApiResponse<PostResponse> createPost(@ModelAttribute @Valid PostCreationRequest request){
        var res = postService.createPost(request);
        return ApiResponse.<PostResponse>builder().result(res).message("Tạo bài viết thành công").build();
    }


    @PostAuthorize("returnObject.result.userResponse.username == authentication.name") //người đăng post đc update -> bắt buộc phải để mapstruct map
    @PatchMapping("/{postId}")
    public ApiResponse<PostResponse> updatePost(@ModelAttribute @Valid PostUpdateRequest request ,@PathVariable(value="postId") String postId){
        var res = postService.updatePost(postId, request);
        return ApiResponse.<PostResponse>builder().result(res).message("Cập nhật bài viết thành công").build();
    }

    //Chi admin hoac chu bai viet ->
    @PreAuthorize("hasRole('ADMIN') or @postServiceImpl.getPostReponseById(#id).userResponse.username == authentication.name")
    @DeleteMapping("/{postId}")
    public ApiResponse<Void> deletePost(@PathVariable(value="postId") String id){
        postService.deletePost(id);
        return ApiResponse.<Void>builder().message("Đã xóa thành công bài viết ID:" + id).build();


    }

    @GetMapping("/getAll")
    public ApiResponse<List<PostResponse>> getAllPost(){

        return ApiResponse.<List<PostResponse>>builder()
                .result(postService.getAllPost())
                .message("Lấy danh sách tất cả bài viết thành công").build();

    }

}
