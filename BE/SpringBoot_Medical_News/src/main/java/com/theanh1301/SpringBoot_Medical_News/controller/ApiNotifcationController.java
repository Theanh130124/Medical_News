package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.NotificationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.NotificationResponse;
import com.theanh1301.SpringBoot_Medical_News.service.NotificationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiNotifcationController {

    NotificationService notificationService;

    @PostMapping
    public ApiResponse<NotificationResponse> create(@RequestBody NotificationRequest request) {
         return ApiResponse.<NotificationResponse>builder().result(notificationService.create(request)).message("Tạo thông báo thành công").build();
    }

    @GetMapping("/user/{userId}")
    public ApiResponse<List<NotificationResponse>> getByUser(@PathVariable String userId) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getByUser(userId))
                .message("Danh sách thông báo của user " + userId)
                .build();
    }

    @GetMapping("/user/{userId}/unread")
    public ApiResponse<List<NotificationResponse>> getUnreadByUser(@PathVariable String userId) {
        return ApiResponse.<List<NotificationResponse>>builder()
                .result(notificationService.getUnreadByUser(userId))
                .message("Danh sách thông báo chưa đọc của user " + userId)
                .build();
    }
    @PatchMapping("/{id}/read")
    public ApiResponse<Void> markAsRead(@PathVariable String id) {
        notificationService.markAsRead(id);
        return ApiResponse.<Void>builder()
                .message("Đã đánh dấu thông báo " + id + " là đã đọc")
                .build();
    }
    @PatchMapping("/user/{userId}/read-all")
    public ApiResponse<Void> markAllAsRead(@PathVariable String userId) {
        notificationService.markAllAsRead(userId);
        return ApiResponse.<Void>builder()
                .message("Tất cả thông báo của user " + userId + " đã được đánh dấu là đã đọc")
                .build();
    }

    public ApiResponse<Void> delete(@PathVariable String id) {
        notificationService.delete(id);
        return ApiResponse.<Void>builder()
                .message("Đã xoá thông báo " + id)
                .build();
    }

    @DeleteMapping("/user/{userId}")
    public ApiResponse<Void> deleteAllByUser(@PathVariable String userId) {
        notificationService.deleteAllByUser(userId);
        return ApiResponse.<Void>builder()
                .message("Đã xoá tất cả thông báo của user " + userId)
                .build();
    }
}
