package com.theanh1301.SpringBoot_Medical_News.config;

import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.repository.RoleRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Configuration
@Slf4j
//Khơi tạo lần đầu chạy app
public class ApplicationInitConfig {


   PasswordEncoder passwordEncoder; //đã thêm vào bean bên SecurityConfig





    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository,RoleRepository roleRepository) {
        return args -> {

            Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                    .orElseGet(() -> {
                        Role role = Role.builder()
                                .name(RoleName.ADMIN)
                                .description("Administrator role")
                                .build();
                        roleRepository.save(role);
                        log.info("Tạo lần đầu role ADMIN.");
                        return role;
                    });
            //Tạo nếu chưa có
            if(userRepository.findByUsername("admin").isEmpty()) {
                User user = User.builder().username("admin").password(passwordEncoder.encode("12345678"))
                        .role(adminRole).build();
                userRepository.save(user);
                log.warn("Admin được tạo ra với mặt khẩu mặc định");
            }
        };
    }

}
