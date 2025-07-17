package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring") //mapstruct -> đk thành bean
public interface UserMapper {

    //Mapstruct tự map các fields trùng tên giữa dto và entity (target la fields tác gốc của User -> mapper do biến)
    @Mapping(target = "role" , ignore = true)
    User toUser()

}
