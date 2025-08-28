package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.service.PostService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClient;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiPostController {


    PostService postService;

    PaginationProperties paginationProperties;




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

//    @PostAuthorize("@postServiceImpl.canAccessPost(returnObject.result,authentication.name)")
    @GetMapping("/user/{userId}")
    public ApiResponse<Page<PostResponse>> getPostsByUserId(@PathVariable String userId,
                                                            @RequestParam(required = false) Integer size,
                                                            @RequestParam(required = false) Integer page) {

        // Lấy current user từ SecurityContext (có thể null nếu chưa đăng nhập)
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentUsername = null;

        if (authentication != null && authentication.isAuthenticated() &&
                !authentication.getName().equals("anonymousUser")) {
            currentUsername = authentication.getName();
        }
    
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);

        return ApiResponse.<Page<PostResponse>>builder()
                .result(postService.getPostsByUserId(userId, pageable, currentUsername))
                .message("Lấy danh sách bài viết của user thành công")
                .build();
    }


    @GetMapping("/getAll")
    public ApiResponse<Page<PostResponse>> getAllPost(@RequestParam(required = false) Integer size,
                                                      @RequestParam(required = false) Integer page){

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        return ApiResponse.<Page<PostResponse>>builder()
                .result(postService.getAllPost(pageable))
                .message("Lấy danh sách tất cả bài viết thành công").build();

    }



    @PostMapping("/survey/vote/{optionId}")
    public ApiResponse<Void> voteSurvey(@PathVariable String optionId, @RequestParam String userId) {
        postService.voteSurveyOption(optionId, userId);
        return ApiResponse.<Void>builder().message("Bình chọn thành công").build();
    }


    @DeleteMapping("/survey/vote/{optionId}")
    public ApiResponse<Void> deleteVote(@PathVariable String optionId, @RequestParam String userId) {
        postService.deleteSurveyVote(optionId, userId);
        return ApiResponse.<Void>builder().message("Hủy bỏ bình chọn thành công").build();
    }

//Khi gọi sẽ thấy public , friend và của chính mình
    //Authen?
    @GetMapping("/visible")
    public ApiResponse<Page<PostResponse>> getVisiblePosts(@RequestParam(required = false) Integer size,
                                                           @RequestParam(required = false) Integer page,
                                                           @RequestParam String currentUserId) {
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        return ApiResponse.<Page<PostResponse>>builder()
                .result(postService.getVisiblePosts(currentUserId, pageable))
                .message("Lấy danh sách bài viết theo quyền xem thành công")
                .build();
    }

    @GetMapping("/public/normal/doctor/top-reactions")
    public ApiResponse<Page<PostResponse>> getPublicNormalDoctorPostsOrderByReactions(
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer page) {

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);

        return ApiResponse.<Page<PostResponse>>builder()
                .result(postService.getPublicNormalDoctorPostsOrderByReactions(pageable))
                .message("Lấy danh sách bài viết NORMAL (public, của doctor) có nhiều reaction nhất thành công")
                .build();
    }







}
