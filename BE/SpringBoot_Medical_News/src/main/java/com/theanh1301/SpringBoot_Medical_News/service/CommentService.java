package com.theanh1301.SpringBoot_Medical_News.service;


import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CommentUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CommentResponse;

import java.util.List;

public interface CommentService {

    CommentResponse createComment(CommentCreationRequest request);
    CommentResponse updateComment(String commentId ,CommentUpdateRequest request);
    void deleteComment(String commentId);
    List<CommentResponse> getCommentByPostId(String postId);
    CommentResponse getCommentResponseById(String commentId);
}
