package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.Follow;
import com.theanh1301.SpringBoot_Medical_News.entity.FollowId;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow,String> {
    boolean existsById(FollowId followId);
    void deleteById(FollowId followId);

    Page<Follow> findAllByFollowerId(User follower , Pageable pageable); // nguười đang theo dõi

    Page<Follow> findAllByFollowingId(User following, Pageable pageable); //Đang theo dõi

    Optional<Follow> findById(FollowId followId);
}
