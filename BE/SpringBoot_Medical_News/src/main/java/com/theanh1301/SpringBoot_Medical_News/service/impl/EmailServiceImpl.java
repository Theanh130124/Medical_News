package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.service.EmailService;
import jakarta.mail.Message;
import jakarta.mail.PasswordAuthentication;
import jakarta.mail.Transport;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import jakarta.mail.Session;
import java.util.Properties;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // côi makeFinal nữa

public class EmailServiceImpl implements EmailService {



    @Value("${email.username}")
    String username;

    @Value("${email.password}")
    String password; // App password


    public void sendAccountDoctorInfoEmail(User user){

        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");

        Session session = Session.getInstance(props,
                new jakarta.mail.Authenticator() {
                    protected PasswordAuthentication getPasswordAuthentication() {
                        return new PasswordAuthentication(username, password);
                    }
                });
        try {
            Message message = new MimeMessage(session);
            message.setFrom(new InternetAddress(this.username, "Hệ thống thông tin y tế trực tuyến"));
            message.setRecipients(Message.RecipientType.TO, InternetAddress.parse(user.getEmail()));
            message.setSubject("Thông tin tài khoản Doctor");

            String content = String.format("""
                <html>
                  <body>
                    <h2>Xin chào Bác sĩ %s,</h2>
                    <p>Tài khoản Bác sĩ của bạn đã được tạo thành công.</p>
                    <ul>
                      <li><strong>Tên đăng nhập:</strong> %s</li>
                      <li><strong>Mật khẩu:</strong> %s</li>
                      <li><strong>Thời gian tạo:</strong> %s</li>
                    </ul>
                    <p>Vui lòng đăng nhập và cung cấp giấy phép hành nghề để có thể đổi mật khẩu ngay sau khi sử dụng lần đầu.</p>
                    <br/>
                    <p>Trân trọng,<br/>Hệ thống thông tin y tế trực tuyến</p>
                  </body>
                </html>
            """, user.getLastName() + user.getFirstName(), user.getUsername(), user.getUsername() + "@123", user.getCreatedAt());

                message.setContent(content, "text/html; charset=UTF-8");
                Transport.send(message);
                System.out.println("Email tài khoản Doctor đã được gửi đến: " + user.getUsername());
            } catch (Exception e) {
                e.printStackTrace();
            }

    }
}
