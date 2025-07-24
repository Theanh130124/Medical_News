package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApiUserController {


    UserService userService;
    //@RequestBody -> gửi json
    @PostMapping
    public ApiResponse<UserResponse> createUser(@ModelAttribute @Valid UserCreationRequest request ,
                                                @RequestParam(value = "avatar")MultipartFile avatar){

        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setResult(userService.createUser(request, avatar));
        return response;
    }


    @PreAuthorize("hasRole('ADMIN')") // TỰ điền ROLE_  , tuy CSDL không lưu nhưng trong SCOPE jwt có
    @GetMapping
    public List<UserResponse> getUsers(){

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}", authentication.getName());
        authentication.getAuthorities().forEach(authority -> log.info(authority.getAuthority()));

        return userService.getAllUsers();

    }
}
