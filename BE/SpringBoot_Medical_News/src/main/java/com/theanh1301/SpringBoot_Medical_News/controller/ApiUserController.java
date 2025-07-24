package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.service.UserService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PostAuthorize;
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
    public ApiResponse<UserResponse> createUser(@ModelAttribute @Valid UserCreationRequest request){

        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setResult(userService.createUser(request));
        return response;
    }

    //Trc method run
    @PreAuthorize("hasRole('ADMIN')") // TỰ điền ROLE_  , tuy CSDL không lưu nhưng trong SCOPE jwt có
    @GetMapping
    public List<UserResponse> getUsers(){

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}", authentication.getName());
        authentication.getAuthorities().forEach(authority -> log.info(authority.getAuthority()));

        return userService.getAllUsers();

    }

    //Sau method run
    @PostAuthorize("returnObject.username == authentication.name") //Chỉ current_user
    @GetMapping("/{userId}")
    public UserResponse getUserById(@PathVariable(value = "userId") String id){
        return userService.getUserById(id);
    }

    @PostAuthorize("returnObject.username == authentication.name")
    @PatchMapping("/{userId}")
    public UserResponse updateUser(@PathVariable(value="userId") String id ,
                                   @ModelAttribute UserUpdateRequest request){
        return userService.updateUser(id, request);

    }

}
