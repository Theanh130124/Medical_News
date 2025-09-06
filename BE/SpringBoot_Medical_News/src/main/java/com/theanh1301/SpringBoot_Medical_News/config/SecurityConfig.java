package com.theanh1301.SpringBoot_Medical_News.config;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import javax.crypto.spec.SecretKeySpec;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // phần quyền theo @PreAuthorize
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal=true)
public class SecurityConfig {


    //Field final được gán thi Spring không injection
     String[] PUBLIC_ENDPOINTS = {
            "/api/users",
            "/api/auth/login",
            "/api/auth/logout",
            "/api/auth/introspect",
            "/api/auth/refresh",
            "/api/certificate",
            "/api/posts/public/normal/doctor/top-reactions",
            "/api/search/posts"



     };




    @Value("${jwt.signerKey}")
    @NonFinal
    String jwtSignerKey;

    @Value("${cloudinary.cloud_name}")
    @NonFinal
    String cloudName;

    @Value("${cloudinary.api_key}")
    @NonFinal
    String apiKey;

    @Value("${cloudinary.api_secret}")
    @NonFinal
    String apiSecret;





    CustomJwtDecoder customJwtDecoder;

    @Bean
    @Order(1)
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.securityMatcher("/api/**").cors(cors -> cors.configurationSource(corsConfigurationSource())).
                authorizeHttpRequests(request -> request.requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .anyRequest().authenticated());
        //cung cap token hop le vao header(cai nay xu ly ktra)
        httpSecurity.oauth2ResourceServer(oauth2 -> oauth2
                .jwt(jwtConfigurer -> jwtConfigurer.decoder(customJwtDecoder)   //decoder de giai ma token (cho logout mk da custom)
                        .jwtAuthenticationConverter(jwtAuthenticationConverter())//set cái custom vào đây


                ).authenticationEntryPoint(new JwtAuthenticationEntryPoint())
        );


        httpSecurity.csrf(AbstractHttpConfigurer::disable);
        return httpSecurity.build();
    }
    //formlogin Gọi loadUserByUsername() của UserDetailService -> nên mình cần có
    @Bean
    @Order(2)
    public SecurityFilterChain formLoginFilterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/css/**", "/js/**", "/images/**").permitAll()
                        .requestMatchers("/login").permitAll()
                        .requestMatchers("/stats").hasAnyAuthority("ADMIN", "DOCTOR")
                .anyRequest().authenticated()
        ).formLogin(form -> form
                .loginPage("/login")
                .loginProcessingUrl("/login")
                .defaultSuccessUrl("/" , true)
                .failureUrl("/login?error=true")
                .permitAll()
        ).logout(logout -> logout.logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .permitAll())
                .csrf(AbstractHttpConfigurer::disable);

        return httpSecurity.build();
    }



    @Bean
    public JwtDecoder jwtDecoder() {
        SecretKeySpec secretKey = new SecretKeySpec(jwtSignerKey.getBytes(), "HS512");
        return NimbusJwtDecoder.withSecretKey(secretKey).macAlgorithm(MacAlgorithm.HS512).build();
    }



    //Custom lại tiền tố ->//Trong scope thì vẫn còn ROLE_ADMIN , CREATE_POST ...  , trong grantedAuthority -> không có tiền tố ROLE_
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter jwtGrantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        jwtGrantedAuthoritiesConverter.setAuthorityPrefix(""); // gán tiền tố -> đã gán bên AuthenticationService
        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(jwtGrantedAuthoritiesConverter);
        return jwtAuthenticationConverter;
    }


    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }


    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }


    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration config = new CorsConfiguration();

        config.setAllowedOrigins(List.of("http://localhost:3000")); // frontend origin-> nữa có thể thay đổi
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"));
        config.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        config.setExposedHeaders(List.of("Authorization"));
        config.setAllowCredentials(true); // Nếu dùng cookie/session

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);

        return source;
    }

}
