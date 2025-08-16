package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.NotificationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.NotificationResponse;

import java.util.List;

public interface NotificationService {
    NotificationResponse create(NotificationRequest request);
    List<NotificationResponse> getByUser(String userId);
    List<NotificationResponse> getUnreadByUser(String userId);
    void markAsRead(String notificationId);
    void markAllAsRead(String userId);
    void delete(String notificationId);
    void deleteAllByUser(String userId);
}
