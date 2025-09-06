package com.theanh1301.SpringBoot_Medical_News.controller;

import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.PostResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.SearchHistoryResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.service.SearchHistoryService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiSearchHistoryController {

    SearchHistoryService searchHistoryService;
    PaginationProperties paginationProperties;

    @GetMapping
    public ApiResponse<Page<UserResponse>> search(@RequestParam String keyword,
                                                  @RequestParam(required = false) String userId,
                                                  @RequestParam(required = false) Integer size,
                                                  @RequestParam(required = false) Integer page) {
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        return ApiResponse.<Page<UserResponse>>builder()
                .result(searchHistoryService.searchUsers(keyword, pageable, userId))
                .message("Tìm kiếm thành công")
                .build();
    }

    @GetMapping("/history")
    public ApiResponse<Page<SearchHistoryResponse>> getHistory(
            @RequestParam String userId,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer page)
    {
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        return ApiResponse.<Page<SearchHistoryResponse>>builder()
                .result(searchHistoryService.getSearchHistory(pageable, userId))
                .message("Lấy lịch sử tìm kiếm thành công")
                .build();
    }

    @GetMapping("/posts")
    public ApiResponse<Page<PostResponse>> searchPosts(
            @RequestParam String keyword,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer page) {

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);

        return ApiResponse.<Page<PostResponse>>builder()
                .result(searchHistoryService.searchPosts(keyword, pageable, userId))
                .message("Tìm kiếm bài viết thành công")
                .build();
    }



    @DeleteMapping("/history")
    public ApiResponse<Void> deleteSearchHistory(
            @RequestParam String userId,
            @RequestParam(required = false) String historyId) {

        searchHistoryService.deleteSearchHistory(userId, historyId);

        return ApiResponse.<Void>builder()
                .message(historyId != null ? "Xóa mục lịch sử thành công" : "Xóa toàn bộ lịch sử thành công")
                .build();
    }
    //Trả ra các keyword tìm gần đây và k bị trùng
    @GetMapping("/suggestions")
    public ApiResponse<Page<String>> getSearchSuggestions(
            @RequestParam String userId,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) Integer page) {

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);

        return ApiResponse.<Page<String>>builder()
                .result(searchHistoryService.getSearchSuggestions(userId, pageable))
                .message("Lấy gợi ý tìm kiếm thành công")
                .build();
    }
}