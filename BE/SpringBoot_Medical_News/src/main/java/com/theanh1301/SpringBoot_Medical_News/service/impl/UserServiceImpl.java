package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorSearchRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Doctor;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.UserMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.DoctorRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.RoleRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.EmailService;
import com.theanh1301.SpringBoot_Medical_News.service.UserService;
import com.theanh1301.SpringBoot_Medical_News.specification.UserSpecification;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

import java.util.logging.Level;
import java.util.logging.Logger;

import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserServiceImpl implements  UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;
    Cloudinary cloudinary;
    EmailService emailService;
    DoctorRepository doctorRepository;


    //Clean code lại -> xử lý image


    @Override
    public UserUpdateRequest getUserUpdateRequestById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        return userMapper.toUserUpdateRequest(userMapper.toUserResponse(user));
    }

    //Kiểm tra login của form login
    @Override
    public UserDetails loadUserByUsername (String username) throws UsernameNotFoundException {
        User user = userRepository.getUserByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        return new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                List.of(new SimpleGrantedAuthority(user.getRole().getName().toString()))  //Bỏ role vào Authority để thymeleaf mình phân ben html
        );

    }

    @Override
    public UserResponse createUser(UserCreationRequest request){

        //Ktra username ton tai chua
        if(userRepository.existsByUsername(request.getUsername())){
            throw new AppException(ErrorCode.USER_EXISTS);
        }
        if(userRepository.existsByEmail(request.getEmail())){
            throw new AppException(ErrorCode.EMAIL_EXISTS);
        }
        if(userRepository.existsByPhoneNumber(request.getPhoneNumber())){
            throw new AppException(ErrorCode.PHONENUMBER_EXIST);
        }


        User user = userMapper.toUser(request);//map các trường user vào request
        MultipartFile avatar = request.getAvatar();
        if (avatar != null && !avatar.isEmpty()) {
            try{
                Map res = cloudinary.uploader().upload(avatar.getBytes(),
                ObjectUtils.asMap("resource_type", "auto"));
                user.setAvatar(res.get("secure_url").toString());
            }catch (IOException ex){
                Logger.getLogger(UserServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }

        }else{
            user.setAvatar("https://res.cloudinary.com/dxiawzgnz/image/upload/v1744000840/qlrmknm7hfe81aplswy2.png");
        }

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        user.setRole(role);
        user.setCreatedAt(Instant.now());
        //Admin tạo -> tách qua thymeleaf
        if(role.getName().equals(RoleName.DOCTOR)){
            user.setIsActive(false); //false nếu doctor -> để xét duyệt mới true
            user.setPassword(passwordEncoder.encode(user.getUsername()+"@123"));
            userRepository.save(user); //Lưu để có userId

            Doctor doctor = Doctor.builder()
                    .user(user)
                    .specialty("Chưa cập nhật")
                    .yearsOfExperience(0)
                    .workplace("Chưa cập nhật")
                    .educationalLevel("Chưa cập nhật")
                    .introduction("Chưa cập nhật")
                    .build();
            doctorRepository.save(doctor);
            emailService.sendAccountDoctorInfoEmail(user);

        }else {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        userRepository.save(user);


        //Chỉ trả ra các thông tin response
        return userMapper.toUserResponse(user);
    }

    //Không để id trong request -> id bắt trên PathVariable
    @Override
    public UserResponse updateUser(String id , UserUpdateRequest request) {

        User user = userRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));

        userMapper.updateUser(user, request); //   mapstruct các trg kia
        if(request.getPassword() != null && !request.getPassword().isEmpty()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        MultipartFile avatar = request.getAvatar();
        //Đưa multipart và string cho user nhận
        if (avatar != null && !avatar.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(avatar.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto"));
                user.setAvatar(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(UserServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }
        }
        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Override
    public User getUserByUsername(String username){
        return userRepository.getUserByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
    }

    @Override
    public UserResponse getUserResponseByUsername(String username) {
        User user = userRepository.getUserByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        return userMapper.toUserResponse(user);
    }

    @Override
    public Page<UserResponse> getAllUsers(Pageable pageable)  {
        return userRepository.getAllUsers(pageable).map(userMapper::toUserResponse);
    }


    @Override
    public UserResponse getUserById(String id){
        return userMapper.toUserResponse(userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS) ));
    }
    @Override
    public void deleteUserById(String id){
         userRepository.deleteById(id);
    }


    @Override
    public Page<UserResponse> findAllUserIsActive(Pageable pageable) {
       Page<User> users = userRepository.findAllUserIsActive(pageable);
        return users.map(userMapper::toUserResponse); // Map page -> có thêm .map
    }

    @Override
    public long countUserIsActive() {
        return  userRepository.countUserIsActive();
    }

    @Override
    public long countAllUser() {
        return userRepository.countAllUser();
    }


    @Override
    public Page<UserResponse> getUserByRole(RoleName roleName, Pageable pageable) {
        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        return userRepository.getUserByRole(role, pageable).map(userMapper::toUserResponse);
    }

    @Override
    public Page<UserResponse> searchDoctors(DoctorSearchRequest request, Pageable pageable) {
        return userRepository.findAll(UserSpecification.filterByRequest(request), pageable).map(userMapper::toUserResponse);
    }
}
