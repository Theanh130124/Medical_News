package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
    List<Notification> findByUserIdAndIsReadFalseOrderByCreatedAtDesc(String userId);
    void deleteByUserId(String userId);
}
