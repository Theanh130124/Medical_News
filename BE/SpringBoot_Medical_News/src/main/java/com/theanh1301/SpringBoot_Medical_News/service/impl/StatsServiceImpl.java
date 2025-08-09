package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.StatsRequest;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.repository.PostRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.StatsService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;


@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class StatsServiceImpl implements StatsService {


    UserRepository userRepository;
    PostRepository postRepository;



    private void validateRequest(StatsRequest request) {
        if ((request.getMonth() != null || request.getQuarter() != null) && request.getYear() == null) {
            throw new AppException(ErrorCode.STATS_YEAR_VALIDATED);
        }
        if (request.getYear() != null && request.getMonth() != null && request.getQuarter() != null) {
            throw new AppException(ErrorCode.STATS_MONTH_QUARTER_VALID);
        }
    }

    @Override
    public Page<User> findUsersByStats(Pageable pageable, StatsRequest request) {
        validateRequest(request);
        return userRepository.findUsersByStats(pageable,request.getMonth(),request.getQuarter(),request.getYear());
    }

    @Override
    public List<Object[]> countUsersStats(StatsRequest request) {
        validateRequest(request);
        return userRepository.countUsersStats(request.getMonth(),request.getQuarter(),request.getYear());
    }

    @Override
    public List<Object[]> countPostStats(StatsRequest request) {
        validateRequest(request);
        return postRepository.countPostStats(request.getMonth(),request.getQuarter(),request.getYear());
    }

    @Override
    public Page<Post> findPostsByStats(Pageable pageable, StatsRequest request) {
        validateRequest(request);
        return postRepository.findPostsByStats(pageable,request.getMonth(),request.getQuarter(),request.getYear());
    }

    @Override
    public Object[] getCommentAndReactionCountByPost(String postId) {
        Post post = postRepository.findById(postId).orElseThrow(()-> new AppException(ErrorCode.POST_NOT_FOUND));
        return postRepository.getCommentAndReactionCountByPost(post);
    }
}
