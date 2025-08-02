package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.List;

public interface UserService extends UserDetailsService {
    UserDetails loadUserByUsername (String username) throws UsernameNotFoundException;
    UserResponse createUser(UserCreationRequest request);
    UserResponse updateUser(String id , UserUpdateRequest request);
    User getUserByUsername(String username);
    Page<UserResponse> getAllUsers(Pageable pageable); //Page đã có List
    UserResponse getUserById(String id);
    void deleteUserById(String id);
    UserResponse getUserResponseByUsername(String username);
    Page<UserResponse> findAllUserIsActive(Pageable pageable);
    long countUserIsActive();
    long countAllUser();
    Page<UserResponse> getUserByRole(RoleName roleName , Pageable pageable);

}
