package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;

public interface EmailService {
    void sendAccountDoctorInfoEmail(User user);
    void sendRejectionEmail(User user, String reason);
}
