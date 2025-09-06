package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.NotificationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    NotificationResponse create(NotificationRequest request);
    List<NotificationResponse> createBatch(NotificationRequest request, String targetType);
    List<NotificationResponse> getByUser(String userId);
    List<NotificationResponse> getUnreadByUser(String userId);
    void markAsRead(String notificationId);
    void markAllAsRead(String userId);
    void delete(String notificationId);
    void deleteAllByUser(String userId);
    Page<NotificationResponse> getAllNotifications(Pageable pageable);
    NotificationResponse getNotificationById(String id);
    NotificationResponse update(String id, NotificationRequest request);
}
