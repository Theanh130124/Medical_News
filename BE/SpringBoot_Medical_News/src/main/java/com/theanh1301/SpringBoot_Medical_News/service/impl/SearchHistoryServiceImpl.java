package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.mapper.UserMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.SearchHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchHistoryServiceImpl implements SearchHistoryService {

    static String SEARCH_HISTORY_KEY = "search_history:";

    UserRepository userRepository;
    UserMapper userMapper;
    StringRedisTemplate redisTemplate;


    @Override
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable, String userId) {
        Page<User> users = userRepository.searchUserByFullName(keyword, pageable);
        Page<UserResponse> responses = users.map(userMapper::toUserResponse);

        String key = SEARCH_HISTORY_KEY + userId;
        redisTemplate.opsForList().leftPush(key, keyword);
        redisTemplate.expire(key, Duration.ofDays(7));

        return responses;
    }


    @Override
    public Page<String> getSearchHistory(Pageable pageable, String userId) {
        String key = SEARCH_HISTORY_KEY + userId;

        List<String> allHistory = redisTemplate.opsForList().range(key, 0, -1);
        if (allHistory == null) {
            allHistory = List.of();
        }

        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), allHistory.size());

        List<String> pagedHistory = allHistory.subList(start, end);
        return new PageImpl<>(pagedHistory, pageable, allHistory.size());
    }

}
