package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;
import com.theanh1301.SpringBoot_Medical_News.service.CommentService;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/comments")
public class ApiCommentController {

    CommentService commentService;
    PaginationProperties paginationProperties;




    @PostMapping
    public ApiResponse<CommentResponse> createComment(@RequestBody @Valid CommentCreationRequest request){
        var res = commentService.createComment(request);
        return ApiResponse.<CommentResponse>builder().result(res).message("Tạo comment thành công").build();
    }


    @PostAuthorize("returnObject.result.userResponse.username == authentication.name")
    @PatchMapping("/{commentId}")
    public ApiResponse<CommentResponse> updateComment(@RequestBody @Valid CommentUpdateRequest request , @PathVariable(value = "commentId") String id){
        var res = commentService.updateComment(id , request);
        return  ApiResponse.<CommentResponse>builder().result(res).message("Cập nhật bình luận thành công").build();
    }

    //Admin chủ cmt
    @PreAuthorize("hasRole('ADMIN') or @commentServiceImpl.getCommentResponseById(#id).userResponse.username == authentication.name")
    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable(value = "commentId") String id){
        commentService.deleteComment(id);
        return ApiResponse.<Void>builder().message("Xóa thành công bình luận ID:"+id).build();
    }


//Test lại  //required = false không bắt buộc
    @GetMapping("/byPostId/{postId}")
    public ApiResponse<Page<CommentResponse>> getAllCommentByPost(@PathVariable(value = "postId") String id ,
                                                                  @RequestParam(required = false) int page , @RequestParam(required = false) Integer size) {
        Pageable pageable = PaginationUtils.createPageable(page,size, paginationProperties);
        var res = commentService.getCommentsByPostId(id,pageable);
        long count = commentService.countCommentByPost(id);
        return ApiResponse.<Page<CommentResponse>>builder().result(res).count(count).message("Lấy các bình luận của một bài viết thành công").build();
    }





}
