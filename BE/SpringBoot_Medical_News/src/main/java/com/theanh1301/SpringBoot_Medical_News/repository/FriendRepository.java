package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.Friend;
import com.theanh1301.SpringBoot_Medical_News.entity.FriendId;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.FriendStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend,FriendId> {

    boolean existsById(FriendId friendId);
    Optional<Friend> findById(FriendId friendId);

    Page<Friend> findAllByFirstUserAndStatus(User user, FriendStatus status, Pageable pageable);


    Page<Friend> findAllBySecondUserAndStatus(User user, FriendStatus status, Pageable pageable);


    @Query("""
        SELECT f FROM Friend f
        WHERE (f.firstUser.id = :userId OR f.secondUser.id = :userId)
          AND f.status = com.theanh1301.SpringBoot_Medical_News.enums.FriendStatus.ACCEPTED
        """)
    List<Friend> findAcceptedFriends(@Param("userId") String userId);


    long countByFirstUserAndStatus(User user, FriendStatus status);
    long countBySecondUserAndStatus(User user, FriendStatus status);

    void deleteById(FriendId id);
}
