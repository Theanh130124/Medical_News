package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;

public interface UserService extends UserDetailsService {
    UserDetails loadUserByUsername (String username) throws UsernameNotFoundException;
    UserResponse createUser(UserCreationRequest request);
    UserResponse updateUser(String id , UserUpdateRequest request);
    User getUserByUsername(String username);
    List<UserResponse> getAllUsers();
    UserResponse getUserById(String id);
    void deleteUserbyId(String id);
    UserResponse getUserResponseByUsername(String username);
    List<UserResponse> findAllUserIsActive();
    long countUserIsActive();
    long countAllUser();
}
