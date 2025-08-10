package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.Friend;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FriendRepository extends JpaRepository<Friend,String> {
}
