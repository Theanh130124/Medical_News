package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorSearchRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.UserUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.data.domain.Page;

import java.util.List;

@Mapper(componentModel = "spring" ,
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE) //bỏ qua các null trong update
//mapstruct -> đk thành bean
public interface UserMapper {

    //Mapstruct -> tự map các fields trùng tên giữa dto và entity (target la fields tác gốc của User -> mapper do biến)
    @Mapping(target = "role" , ignore = true) // không map role -> xử lý riêng bên UserService
    @Mapping(target = "avatar" , ignore = true)
    User toUser(UserCreationRequest request);


    //fields nào userResponse có thì map từ user vào
    @Mapping(target = "isActive", source = "isActive", defaultValue = "true")
    UserResponse toUserResponse(User user);

    User toUserforSearch(DoctorSearchRequest request);

    List<UserResponse> toUserResponses(List<User> users);

    //@MappingTarget -> không new User
    @Mapping(target = "avatar" , ignore = true)
    void updateUser(@MappingTarget User user, UserUpdateRequest request); //map trừng request vào user(đã có)


    @Mapping(target = "avatar" , ignore = true)
    UserUpdateRequest toUserUpdateRequest(UserResponse userResponse);
}
