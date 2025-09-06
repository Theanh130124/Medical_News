package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.response.*;
import com.theanh1301.SpringBoot_Medical_News.entity.Post;
import com.theanh1301.SpringBoot_Medical_News.entity.SearchHistory;
import com.theanh1301.SpringBoot_Medical_News.entity.SurveyOption;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.TypePost;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.CommentMapper;
import com.theanh1301.SpringBoot_Medical_News.mapper.PostMapper;
import com.theanh1301.SpringBoot_Medical_News.mapper.ReactionMapper;
import com.theanh1301.SpringBoot_Medical_News.mapper.UserMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.*;
import com.theanh1301.SpringBoot_Medical_News.service.SearchHistoryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SearchHistoryServiceImpl implements SearchHistoryService {

    UserRepository userRepository;
    PostRepository postRepository;
    SearchHistoryRepository searchHistoryRepository;
    UserMapper userMapper;
    PostMapper postMapper;
    CommentRepository commentRepository;
    ReactionRepository reactionRepository;
    SurveyOptionRepository surveyOptionRepository;
    SurveyVoteRepository surveyVoteRepository;
    CommentMapper commentMapper;
    ReactionMapper reactionMapper;
    FriendRepository friendRepository;

    @Override
    public Page<UserResponse> searchUsers(String keyword, Pageable pageable, String userId) {
        Page<User> users = userRepository.searchUserByFullName(keyword, pageable);
        Page<UserResponse> responses = users.map(userMapper::toUserResponse);

        // Lưu lịch sử tìm kiếm với kết quả
        if (userId != null && !userId.isEmpty()) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

            // Kiểm tra xem từ khóa đã tồn tại chưa
            List<SearchHistory> existingHistories = searchHistoryRepository.findByUserAndKeyword(user, keyword);

            if (existingHistories.isEmpty()) {
                // Tạo mới lịch sử tìm kiếm
                SearchHistory searchHistory = SearchHistory.builder()
                        .user(user)
                        .keyword(keyword)
                        .searchedAt(LocalDateTime.now())
                        .build();
                searchHistoryRepository.save(searchHistory);
            } else {
                // Cập nhật thời gian tìm kiếm
                SearchHistory existingHistory = existingHistories.get(0);
                existingHistory.setSearchedAt(LocalDateTime.now());
                searchHistoryRepository.save(existingHistory);
            }
        }

        return responses;
    }

    @Override
    public Page<SearchHistoryResponse> getSearchHistory(Pageable pageable, String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        Page<SearchHistory> searchHistories = searchHistoryRepository.findByUserOrderBySearchedAtDesc(user, pageable);

        return searchHistories.map(this::convertToSearchHistoryResponse);
    }

    @Override
    @Transactional
    public Page<PostResponse> searchPosts(String keyword, Pageable pageable, String userId) {
        Page<Post> posts;

        if (userId != null && !userId.isEmpty()) {
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

            List<String> friendIds = friendRepository.findAcceptedFriends(currentUser).stream()
                    .map(f -> f.getFirstUser().getId().equals(userId)
                            ? f.getSecondUser().getId()
                            : f.getFirstUser().getId())
                    .collect(Collectors.toList());

            friendIds.add(userId);

            posts = postRepository.searchDoctorPosts(keyword, currentUser, friendIds, pageable);

            // Lưu lịch sử tìm kiếm bài viết
            List<SearchHistory> existingHistories = searchHistoryRepository.findByUserAndKeyword(currentUser, keyword);

            if (existingHistories.isEmpty()) {
                SearchHistory searchHistory = SearchHistory.builder()
                        .user(currentUser)
                        .keyword(keyword)
                        .searchedAt(LocalDateTime.now())
                        .build();
                searchHistoryRepository.save(searchHistory);
            } else {
                SearchHistory existingHistory = existingHistories.get(0);
                existingHistory.setSearchedAt(LocalDateTime.now());
                searchHistoryRepository.save(existingHistory);
            }
        } else {
            posts = postRepository.searchPublicDoctorPosts(keyword, pageable);
        }

        return convertToPostResponsePage(posts);
    }


    @Override
    public void deleteSearchHistory(String userId, String historyId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        if (historyId != null && !historyId.isEmpty()) {
            // Xóa một mục lịch sử cụ thể
            searchHistoryRepository.deleteByUserAndId(user, historyId);
        } else {
            // Xóa toàn bộ lịch sử
            searchHistoryRepository.deleteAllByUser(user);
        }
    }

    @Override
    public Page<String> getSearchSuggestions(String userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        return searchHistoryRepository.findDistinctKeywordsByUser(user, pageable);
    }

    private SearchHistoryResponse convertToSearchHistoryResponse(SearchHistory searchHistory) {
        return SearchHistoryResponse.builder()
                .id(searchHistory.getId())
                .keyword(searchHistory.getKeyword())
                .searchTime(searchHistory.getSearchedAt())
                .build();
    }

    private Page<PostResponse> convertToPostResponsePage(Page<Post> posts) {
        return posts.map(post -> {
            PostResponse res = postMapper.toPostResponse(post);

            if (post.getType() == TypePost.SURVEY) {
                List<SurveyOption> options = surveyOptionRepository.findByPost(post);
                res.setSurveyOptions(options.stream().map(opt -> {
                    long voteCount = surveyVoteRepository.countByOption(opt);
                    return new SurveyOptionResponse(opt.getId(), opt.getOptionText(), voteCount, null);
                }).toList());
            }

            List<CommentResponse> commentList = commentRepository.getCommentByPost(post)
                    .stream().map(commentMapper::toCommentResponse).toList();
            res.setComments(commentList);
            res.setCountComment(commentRepository.countCommentByPost(post));

            List<ReactionResponse> reactionList = reactionRepository.getReactionByPost(post)
                    .stream().map(reactionMapper::toReactionResponse).toList();
            res.setReactions(reactionList);
            res.setCountReaction(reactionRepository.countReactionByPost(post));

            return res;
        });
    }

}