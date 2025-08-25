package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.PostCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.PostUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface PostService {
    PostResponse createPost(PostCreationRequest request);
    PostResponse updatePost(String postId ,PostUpdateRequest request);
    Page<PostResponse> getPostsByUserId(String userId, Pageable pageable);

    void deletePost(String postId);
    PostResponse getPostReponseById(String id);
    Page<PostResponse> getAllPost(Pageable pageable);//Dung cho PreAuthorize
    void voteSurveyOption(String optionId, String userId);
    boolean canAccessPost(Page<PostResponse> page, String currentUser);
    Page<PostResponse> getVisiblePosts(String currentUserId ,Pageable pageable);
    Page<PostResponse> getPublicNormalDoctorPostsOrderByReactions(Pageable pageable);
    void deleteSurveyVote(String optionId, String userId);
}
