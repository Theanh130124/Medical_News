package com.theanh1301.SpringBoot_Medical_News.repository;

import aj.org.objectweb.asm.commons.Remapper;
import com.theanh1301.SpringBoot_Medical_News.entity.Follow;
import com.theanh1301.SpringBoot_Medical_News.entity.FollowId;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.util.Optional;

public interface FollowRepository extends JpaRepository<Follow,FollowId> {
    boolean existsById(FollowId followId);
    void deleteById(FollowId followId);

    Page<Follow> findAllByFollower(User follower , Pageable pageable); // nguười đang theo dõi

    Page<Follow> findAllByFollowing(User following, Pageable pageable); //Đang theo dõi

    Optional<Follow> findById(FollowId followId);

    //Số người đang theo dõi mình
    @Query("select count(f) From Follow f where f.following = :user")
    long countFollowers(@Param("user")User user);

    @Query("select count(f) From Follow  f where f.follower = :user")
    long countFollowing(@Param("user")User user);

    Remapper findWithUsersById(FollowId id);


}
