package com.theanh1301.SpringBoot_Medical_News.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class InternalSecurityConfig {

    /**
     * IP được phép gọi /api/internal/**
     * Cấu hình qua application.properties: internal.allowed-ips=127.0.0.1,172.17.0.2
     */
    @Value("${internal.allowed-ips:127.0.0.1,0:0:0:0:0:0:0:1}")
    private String allowedIpsRaw;

    @Value("${internal.token}")
    private String internalToken;

    /**
     * SecurityFilterChain riêng cho /api/internal/**, ưu tiên cao hơn (Order = 1).
     * - Không dùng JWT
     * - Chỉ kiểm tra IP + X-Internal-Token (xử lý trong controller)
     */
    @Bean
    @Order(1)
    public SecurityFilterChain internalFilterChain(HttpSecurity http) throws Exception {

        List<String> allowedIps = Arrays.asList(allowedIpsRaw.split(","));

        http
                .securityMatcher("/api/internal/**")
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                // IP whitelist filter — chặn trước khi vào controller
                .addFilterBefore(
                        new IpWhitelistFilter(allowedIps),
                        UsernamePasswordAuthenticationFilter.class
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/internal/**").permitAll()
                );

        return http.build();
    }

    // ── IP whitelist filter ───────────────────────────────────────────────────

    /**
     * Từ chối mọi request tới /api/internal/** nếu IP không nằm trong whitelist.
     * Chỉ Flask RAG service (chạy cùng network / docker) mới được gọi.
     */
    static class IpWhitelistFilter extends OncePerRequestFilter {

        private final List<String> allowedIps;

        IpWhitelistFilter(List<String> allowedIps) {
            this.allowedIps = allowedIps;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request,
                                        HttpServletResponse response,
                                        FilterChain chain)
                throws ServletException, IOException {

            String clientIp = getClientIp(request);

            if (!allowedIps.contains(clientIp)) {
                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.getWriter().write("Forbidden: IP not allowed");
                return;
            }

            chain.doFilter(request, response);
        }

        private String getClientIp(HttpServletRequest request) {
            // Hỗ trợ reverse proxy (nginx, docker bridge)
            String forwarded = request.getHeader("X-Forwarded-For");
            if (forwarded != null && !forwarded.isBlank()) {
                return forwarded.split(",")[0].trim();
            }
            return request.getRemoteAddr();
        }
    }
}