package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ReactionResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Reaction;

import java.util.List;

public interface ReactionService {

    ReactionResponse createReaction(ReactionCreationRequest request);
    ReactionResponse updateReaction(String reactionId ,ReactionUpdateRequest request);
    void deleteReaction(String reactionId);
    List<ReactionResponse> getAllReactionsByPost(String postId);
    ReactionResponse getReactionById(String reactionId);
    long countReactionByPost(String postId);

}
