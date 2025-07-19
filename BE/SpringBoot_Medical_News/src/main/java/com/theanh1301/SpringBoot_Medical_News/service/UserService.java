package com.theanh1301.SpringBoot_Medical_News.service;


import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.UserMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.RoleRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {

    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;
    RoleRepository roleRepository;


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

        Role role = roleRepository.findByName(request.getRole())
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        user.setRole(role);
        user.setPassword(passwordEncoder.encode(user.getPassword()));

//
//        if (avatar != null && !avatar.isEmpty()) {
//            try {
//                Map res = cloudinary.uploader().upload(avatar.getBytes(),
//                        ObjectUtils.asMap("resource_type", "auto"));
//                u.setAvatar(res.get("secure_url").toString());
//            } catch (IOException ex) {
//                Logger.getLogger(UserServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
//            }
//            //AVATAR = null
//        } else {
//            u.setAvatar("https://res.cloudinary.com/dxiawzgnz/image/upload/v1744000840/qlrmknm7hfe81aplswy2.png");
//        }
//
        //Admin tạo
        if(role.getName()== RoleName.DOCTOR) {
            //để gửi chứng chỉ
            user.setIsActive(false);
        }
        userRepository.save(user);
        //Chỉ trả ra các thông tin response
        return userMapper.toUserResponse(user);
    }




}
