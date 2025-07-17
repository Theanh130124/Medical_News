package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.UserCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.UserResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring") //mapstruct -> đk thành bean
public interface UserMapper {

    //Mapstruct -> tự map các fields trùng tên giữa dto và entity (target la fields tác gốc của User -> mapper do biến)
    @Mapping(target = "role" , ignore = true) // không map role -> xử lý riêng bên UserService
    User toUser(UserCreationRequest request);


    //fields nào userResponse có thì map từ user vào
    UserResponse toUserResponse(User user);



}
