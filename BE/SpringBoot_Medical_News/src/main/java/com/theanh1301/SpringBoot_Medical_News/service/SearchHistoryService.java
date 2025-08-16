package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.response.FriendResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchHistoryService {
    Page<UserResponse> searchUsers(String keyword, Pageable pageable, String userId);
    Page<String> getSearchHistory(Pageable pageable, String userId);

}
