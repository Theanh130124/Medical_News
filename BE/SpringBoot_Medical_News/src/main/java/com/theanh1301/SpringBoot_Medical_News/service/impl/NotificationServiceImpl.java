package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.NotificationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.NotificationResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Notification;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.NotificationMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.NotificationRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class NotificationServiceImpl implements NotificationService {

    UserRepository userRepository;
    NotificationMapper notificationMapper;
    NotificationRepository notificationRepository;

    @Override
    public NotificationResponse create(NotificationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        Notification notification = Notification.builder()
                .user(user)
                .message(request.getMessage())
                .isRead(false)
                .build();

        return notificationMapper.toNotificationResponse(notificationRepository.save(notification));
    }

    @Override
    @Transactional
    public List<NotificationResponse> createBatch(NotificationRequest request, String targetType) {
        List<User> targetUsers;

        switch (targetType.toUpperCase()) {
            case "ALL":
                targetUsers = userRepository.findByIsActiveTrue();
                break;
            case "DOCTOR":
                targetUsers = userRepository.findByRoleNameAndIsActiveTrue(RoleName.DOCTOR);
                break;
            case "USER":
                targetUsers = userRepository.findByRoleNameAndIsActiveTrue(RoleName.USER);
                break;
            default:
                throw new AppException(ErrorCode.INVALID_TARGET_TYPE);
        }

        List<Notification> notifications = targetUsers.stream()
                .map(user -> Notification.builder()
                        .user(user)
                        .message(request.getMessage())
                        .isRead(false)
                        .build())
                .toList();

        List<Notification> savedNotifications = notificationRepository.saveAll(notifications);
        return savedNotifications.stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    @Override
    public List<NotificationResponse> getUnreadByUser(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

//    @Override
//    public Long countUnreadByUser(String userId) {
//        return notificationRepository.countByUserIdAndIsReadFalse(userId);
//    }

    @Override
    @Transactional
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unreadNotifications = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        unreadNotifications.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(unreadNotifications);
    }

    @Override
    @Transactional
    public void delete(String notificationId) {
        if (!notificationRepository.existsById(notificationId)) {
            throw new AppException(ErrorCode.NOTIFICATION_NOT_FOUND);
        }
        notificationRepository.deleteById(notificationId);
    }

    @Override
    @Transactional
    public void deleteAllByUser(String userId) {
        notificationRepository.deleteByUserId(userId);
    }

    @Override
    public Page<NotificationResponse> getAllNotifications(Pageable pageable) {
        return notificationRepository.findAll(pageable)
                .map(notificationMapper::toNotificationResponse);
    }

    @Override
    public NotificationResponse getNotificationById(String id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        return notificationMapper.toNotificationResponse(notification);
    }

    @Override
    @Transactional
    public NotificationResponse update(String id, NotificationRequest request) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));

        // CHỈ cập nhật message, giữ nguyên user hiện tại
        notification.setMessage(request.getMessage());

        return notificationMapper.toNotificationResponse(notificationRepository.save(notification));
    }
}