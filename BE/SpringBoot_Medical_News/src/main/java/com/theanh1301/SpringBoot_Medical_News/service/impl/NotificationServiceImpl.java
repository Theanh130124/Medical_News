package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.NotificationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.NotificationResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Notification;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
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
import org.springframework.stereotype.Service;

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
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        Notification notification = Notification.builder()
                .user(user)
                .message(request.getMessage())
                .isRead(false).build(); // chưa xem
        return notificationMapper.toNotificationResponse(notificationRepository.save(notification));
    }

    @Override
    public List<NotificationResponse> getByUser(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    //Danh sách thông báo chưa đọc
    @Override
    public List<NotificationResponse> getUnreadByUser(String userId) {
        return notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId).stream()
                .map(notificationMapper::toNotificationResponse)
                .toList();
    }

    //Đọc noti
    @Override
    public void markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new AppException(ErrorCode.NOTIFICATION_NOT_FOUND));
        notification.setIsRead(true);
        notificationRepository.save(notification);
    }
    //Đọc hết
    @Override
    public void markAllAsRead(String userId) {
        List<Notification> list = notificationRepository.findByUserIdAndIsReadFalseOrderByCreatedAtDesc(userId);
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
    }

    @Override
    public void delete(String notificationId) {
        notificationRepository.deleteById(notificationId);
    }

    @Override
    public void deleteAllByUser(String userId) {
        notificationRepository.deleteByUserId(userId);
    }
}
