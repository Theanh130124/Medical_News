package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.ReactionUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ReactionResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.Reaction;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.ReactionMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.PostRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.ReactionRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.ReactionService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
public class ReactionServiceImpl implements ReactionService {

    ReactionRepository reactionRepository;
    UserRepository userRepository;
    PostRepository postRepository;
    ReactionMapper reactionMapper;

    @Override
    public ReactionResponse createReaction(ReactionCreationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        Post post = postRepository.findById(request.getPostId())
                .orElseThrow(()-> new AppException(ErrorCode.POST_NOT_FOUND));
        Reaction reaction = reactionMapper.toReaction(request);
        reaction.setPost(post);
        reaction.setUser(user);

        reactionRepository.save(reaction);

        return reactionMapper.toReactionResponse(reaction);
    }

    @Override
    public ReactionResponse updateReaction(String reactionId ,ReactionUpdateRequest request) {
        Reaction reaction  = reactionRepository.findById(reactionId)
                .orElseThrow(() -> new AppException(ErrorCode.REACTION_NOT_FOUND));
        reactionMapper.updateReaction(reaction,request);
        reactionRepository.save(reaction);
        return reactionMapper.toReactionResponse(reaction);
    }

    @Override
    public void deleteReaction(String reactionId) {
        reactionRepository.deleteById(reactionId);
    }

    @Override
    public List<ReactionResponse> getAllReactionsByPost(String postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        return reactionRepository.

                getReactionByPost(post).stream().map(reactionMapper::toReactionResponse).collect(Collectors.toList());
    }


    @Override
    public ReactionResponse getReactionById(String reactionId) {
        return reactionMapper.toReactionResponse(reactionRepository
                .findById(reactionId).orElseThrow(() -> new AppException(ErrorCode.REACTION_NOT_FOUND)));
    }

    @Override
    public long countReactionByPost(String postId) {
        Post post = postRepository.findById(postId).orElseThrow(() -> new AppException(ErrorCode.POST_NOT_FOUND));
        return reactionRepository.countReactionByPost(post);
    }
}
