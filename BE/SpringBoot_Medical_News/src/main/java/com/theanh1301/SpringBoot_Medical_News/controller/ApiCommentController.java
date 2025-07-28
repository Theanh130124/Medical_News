package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;
import com.theanh1301.SpringBoot_Medical_News.service.CommentService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/comments")
public class ApiCommentController {

    CommentService commentService;



//Chưa test
    @PostMapping
    public ApiResponse<CommentResponse> createComment(@ModelAttribute @Valid CommentCreationRequest request){
        var res = commentService.createComment(request);
        return ApiResponse.<CommentResponse>builder().result(res).message("Tạo comment thành công").build();
    }

    @PatchMapping("/{commentId}")
    public ApiResponse<CommentResponse> updateComment(@ModelAttribute @Valid CommentUpdateRequest request , @PathVariable(value = "commentId") String id){
        var res = commentService.updateComment(id , request);
        return  ApiResponse.<CommentResponse>builder().result(res).message("Cập nhật bình luận thành công").build();
    }

    @DeleteMapping("/{commentId}")
    public ApiResponse<Void> deleteComment(@PathVariable(value = "commentId") String id){
        commentService.deleteComment(id);
        return ApiResponse.<Void>builder().message("Xóa thành công bình luận ID:"+id).build();
    }

    @GetMapping("/byPostId/{postId}")
    public ApiResponse<List<CommentResponse>> getCommentByPost(@PathVariable(value = "postId") String id){
        var res = commentService.getCommentByPostId(id);
        return ApiResponse.<List<CommentResponse>>builder().result(res).message("Lấy các bình luận của một bài viết thành công").build();
    }





}
