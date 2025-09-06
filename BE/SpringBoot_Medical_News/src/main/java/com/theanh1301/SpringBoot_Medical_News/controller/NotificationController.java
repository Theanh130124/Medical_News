package com.theanh1301.SpringBoot_Medical_News.controller;

import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.NotificationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.NotificationResponse;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.service.NotificationService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/notifications")
public class NotificationController {

    NotificationService notificationService;
    PaginationProperties paginationProperties;

    @GetMapping("/create")
    public String formCreateNotification(Model model) {
        if (!model.containsAttribute("notification")) {
            model.addAttribute("notification", new NotificationRequest());
        }
        model.addAttribute("targetTypes", new String[]{"ALL", "DOCTOR", "USER"});
        return "createnotification";
    }

    @PostMapping("/create")
    public String createNotification(@ModelAttribute("notification") @Valid NotificationRequest request,
                                     BindingResult bindingResult,
                                     RedirectAttributes redirectAttributes,
                                     Model model) {

        model.addAttribute("targetTypes", new String[]{"ALL", "DOCTOR", "USER"});

        if (bindingResult.hasErrors()) {
            return "createnotification";
        }

        try {
            if (request.getTargetType() == null || request.getTargetType().isEmpty()) {
                model.addAttribute("error", "Vui lòng chọn đối tượng nhận");
                return "createnotification";
            }

            if ("USER".equals(request.getTargetType()) && (request.getUserId() == null || request.getUserId().isEmpty())) {
                notificationService.createBatch(request, "USER");
            } else if ("ALL".equals(request.getTargetType()) || "DOCTOR".equals(request.getTargetType())) {
                notificationService.createBatch(request, request.getTargetType());
            } else {
                // Gửi cho user cụ thể
                notificationService.create(request);
            }

            redirectAttributes.addFlashAttribute("success", "Tạo thông báo thành công!");
            return "redirect:/notifications/create";
        } catch (AppException e) {
            model.addAttribute("error", e.getMessage());
            return "createnotification";
        } catch (Exception e) {
            model.addAttribute("error", "Đã xảy ra lỗi khi tạo thông báo");
            return "createnotification";
        }
    }

    @GetMapping
    public String listNotifications(Model model,
                                    @RequestParam(defaultValue = "1") Integer page,
                                    @RequestParam(defaultValue = "10") Integer size) {

        Pageable pageable = PaginationUtils.createPageable(page - 1, size, paginationProperties);
        Page<NotificationResponse> notificationPage = notificationService.getAllNotifications(pageable);

        model.addAttribute("notificationPage", notificationPage);
        model.addAttribute("currentPage", page);
        model.addAttribute("pageSize", size);
        return "notifications";
    }
    @GetMapping("/edit/{id}")
    public String editNotificationForm(@PathVariable String id, Model model) {
        try {
            NotificationResponse notificationResponse = notificationService.getNotificationById(id);
            NotificationRequest notificationRequest = new NotificationRequest();
            notificationRequest.setMessage(notificationResponse.getMessage());
            // Sao chép các trường khác nếu cần

            model.addAttribute("notificationResponse", notificationResponse);
            model.addAttribute("notificationRequest", notificationRequest);
            return "editnotification";
        } catch (AppException e) {
            return "redirect:/notifications?error=" + e.getMessage();
        }
    }

    @PostMapping("/edit/{id}")
    public String editNotification(@PathVariable String id,
                                   @ModelAttribute("notificationRequest") @Valid NotificationRequest request,
                                   BindingResult bindingResult,
                                   RedirectAttributes redirectAttributes,
                                   Model model) {

        if (bindingResult.hasErrors()) {
            // Lấy lại thông tin response để hiển thị
            NotificationResponse response = notificationService.getNotificationById(id);
            model.addAttribute("notificationResponse", response);
            return "editnotification";
        }

        try {
            // Sử dụng ID từ path variable
            notificationService.update(id, request);
            redirectAttributes.addFlashAttribute("success", "Cập nhật thông báo thành công!");
            return "redirect:/notifications";
        } catch (AppException e) {
            // Lấy lại thông tin response để hiển thị
            NotificationResponse response = notificationService.getNotificationById(id);
            model.addAttribute("notificationResponse", response);
            model.addAttribute("error", e.getMessage());
            return "editnotification";
        }
    }
    @PostMapping("/delete/{id}")
    public String deleteNotification(@PathVariable String id, RedirectAttributes redirectAttributes) {
        try {
            notificationService.delete(id);
            redirectAttributes.addFlashAttribute("success", "Xóa thông báo thành công!");
        } catch (AppException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/notifications";
    }

    @PostMapping("/mark-as-read/{id}")
    public String markAsRead(@PathVariable String id, RedirectAttributes redirectAttributes) {
        try {
            notificationService.markAsRead(id);
            redirectAttributes.addFlashAttribute("success", "Đã đánh dấu là đã đọc!");
        } catch (AppException e) {
            redirectAttributes.addFlashAttribute("error", e.getMessage());
        }
        return "redirect:/notifications";
    }
}