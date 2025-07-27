package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;

public interface PostService {
    PostResponse createPost(PostCreationRequest request);
    PostResponse updatePost(String postId ,PostUpdateRequest request);
    void deletePost(String postId);
    PostResponse getPostReponseById(String id); //Dung cho PreAuthorize
}
