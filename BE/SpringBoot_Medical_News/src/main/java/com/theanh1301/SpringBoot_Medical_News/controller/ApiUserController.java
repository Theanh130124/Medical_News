package com.theanh1301.SpringBoot_Medical_News.controller;

import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.service.UserService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ApiUserController {


    UserService userService;
    PaginationProperties paginationProperties;
    //@RequestBody -> gửi json
    @PostMapping
    public ApiResponse<UserResponse> createUser(@ModelAttribute @Valid UserCreationRequest request ,
                                                @RequestParam(value = "avatar")MultipartFile avatar){

<<<<<<< Updated upstream
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .message("Tạo tài khoản thành công")
                .build();
=======
        ApiResponse<UserResponse> response = new ApiResponse<>();
        response.setResult(userService.createUser(request, avatar));
        return response;
>>>>>>> Stashed changes
    }

    //Trc method run
    @PreAuthorize("hasRole('ADMIN')") // TỰ điền ROLE_  , tuy CSDL không lưu nhưng trong SCOPE jwt có
    @GetMapping
    public ApiResponse<Page<UserResponse>> getUsers(@RequestParam(required = false) Integer size,
                                                    @RequestParam(required = false) Integer page){


        var authentication = SecurityContextHolder.getContext().getAuthentication();
        log.info("Username: {}", authentication.getName());
        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties);
        authentication.getAuthorities().forEach(authority -> log.info(authority.getAuthority()));
        long count = userService.countAllUser();

        return ApiResponse.<Page<UserResponse>>builder()
                .result(userService.getAllUsers(pageable)).count(count)
                .message("Lấy danh sách người dùng thành công").build();

    }
    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/isActive")
    public ApiResponse<Page<UserResponse>> getActiveUsers(@RequestParam(required = false) Integer size,
                                                          @RequestParam(required = false) Integer page){

        Pageable pageable = PaginationUtils.createPageable(page, size, paginationProperties); // bổ sung sort sau
        var res = userService.findAllUserIsActive(pageable);
        long count = userService.countUserIsActive();
        return ApiResponse.<Page<UserResponse>>builder().result(res).count(count).message("Lấy toàn bộ users đang hoạt động thành công").build();
    }

    //Sau method run  -> returnObject -> là ApiResponse<UserResponse> nếu UserResponse thì  returnObject.username
    @PostAuthorize("returnObject.result.username == authentication.name") //Chỉ current_user
    @GetMapping("/{userId}")
    public ApiResponse<UserResponse> getUserById(@PathVariable(value = "userId") String id){


        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserById(id))
                .message("Lấy thông tin tài khoản thành công").build();
    }

    @PostAuthorize("returnObject.result.username == authentication.name")
    @PatchMapping("/{userId}")
    public ApiResponse<UserResponse> updateUser(@PathVariable(value="userId") String id ,
                                   @ModelAttribute @Valid UserUpdateRequest request){



        return ApiResponse.<UserResponse>builder().result(userService.updateUser(id, request)).message("Cập nhật tài khoản thành công").build();

    }

    //ApiResponse<Void> -> là void nên không lấy username Trong UserResponse
    @PreAuthorize("@userServiceImpl.getUserById(#id).username == authentication.name") //username theo id trên params và username của jwt
    @DeleteMapping("/{userId}")
    public ApiResponse<Void> deleteUser(@PathVariable(value="userId") String id){
        userService.deleteUserById(id);
        return  ApiResponse.<Void>builder().message("Đã xóa tài khoản với ID:" +id).build();
    }



    @GetMapping("/secure/profile")
    public ApiResponse<UserResponse> getCurrentUser(Principal principal){
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserResponseByUsername(principal.getName()))
                .message("Lấy thông tin người dùng hiện tại thành công").build();
    }










}
