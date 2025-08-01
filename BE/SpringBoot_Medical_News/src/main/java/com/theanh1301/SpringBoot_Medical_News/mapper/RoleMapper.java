package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.RoleRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.RoleResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {


    Role toRole(RoleRequest roleRequest);
    RoleResponse toRoleResponse(Role role);
}
