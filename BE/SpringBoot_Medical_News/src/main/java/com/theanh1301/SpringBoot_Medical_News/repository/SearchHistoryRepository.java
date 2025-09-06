package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.SearchHistory;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SearchHistoryRepository extends JpaRepository<SearchHistory, String> {

    Page<SearchHistory> findByUserOrderBySearchedAtDesc(User user, Pageable pageable);

    List<SearchHistory> findByUserOrderBySearchedAtDesc(User user);

    @Query("SELECT sh FROM SearchHistory sh WHERE sh.user = :user AND sh.keyword = :keyword ORDER BY sh.searchedAt DESC")
    List<SearchHistory> findByUserAndKeyword(@Param("user") User user, @Param("keyword") String keyword);

    @Modifying // Đánh dấu là truy vấn (thay đổi dl)
    @Query("DELETE FROM SearchHistory sh WHERE sh.user = :user")
    void deleteAllByUser(@Param("user") User user);

    @Modifying
    @Query("DELETE FROM SearchHistory sh WHERE sh.user = :user AND sh.id = :id")
    void deleteByUserAndId(@Param("user") User user, @Param("id") String id);

    @Query("SELECT DISTINCT sh.keyword FROM SearchHistory sh WHERE sh.user = :user ORDER BY sh.searchedAt DESC")
    Page<String> findDistinctKeywordsByUser(@Param("user") User user, Pageable pageable);
}