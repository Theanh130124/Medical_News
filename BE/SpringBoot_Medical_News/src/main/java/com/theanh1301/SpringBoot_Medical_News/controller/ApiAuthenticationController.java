package com.theanh1301.SpringBoot_Medical_News.controller;


import com.nimbusds.jose.JOSEException;
import com.theanh1301.SpringBoot_Medical_News.dto.request.AuthenticationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.IntrospectRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.LogoutRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.AuthenticationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.IntrospectResponse;
import com.theanh1301.SpringBoot_Medical_News.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.ParseException;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApiAuthenticationController {


    AuthenticationService authenticationService;


    @PostMapping("/login")
    public ApiResponse<AuthenticationResponse> login(@RequestBody AuthenticationRequest request) {
        var res = authenticationService.authenticate(request);
        return ApiResponse.<AuthenticationResponse>builder().result(res).message("Đăng nhập thành công").build();
    }

    @PostMapping("/introspect")
    public ApiResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) throws ParseException , JOSEException {
        var res = authenticationService.introspect(request);
        return ApiResponse.<IntrospectResponse>builder().result(res).build();
    }
    @PostMapping("/logout")
    public ApiResponse<Void> logout(@RequestBody LogoutRequest request) throws ParseException , JOSEException {
        authenticationService.logout(request);
        return ApiResponse.<Void>builder().message("Đăng xuất thành công").build();
    }


}
