package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.SearchHistoryResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchHistoryService {
    Page<UserResponse> searchUsers(String keyword, Pageable pageable, String userId);

    Page<SearchHistoryResponse> getSearchHistory(Pageable pageable, String userId);

    Page<PostResponse> searchPosts(String keyword, Pageable pageable, String userId);


    void deleteSearchHistory(String userId, String historyId);

    Page<String> getSearchSuggestions(String userId, Pageable pageable);

}