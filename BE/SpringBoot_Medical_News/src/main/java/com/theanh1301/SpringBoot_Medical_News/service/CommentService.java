package com.theanh1301.SpringBoot_Medical_News.service;


import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CommentService {

    CommentResponse createComment(CommentCreationRequest request);
    CommentResponse updateComment(String commentId ,CommentUpdateRequest request);
    void deleteComment(String commentId);
    CommentResponse getCommentResponseById(String commentId);
    long countCommentByPost(String postId);
    Page<CommentResponse> getCommentsByPostId(String postId , Pageable pageable);

}
