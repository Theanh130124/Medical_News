package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.RoleRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.RoleResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RoleMapper {

    //Phải bỏ qua vì request vào là Set<String> nhưng thực tế nó là Set<RolePermission> -> nên mình tự map bên service
    @Mapping(target ="permissions", ignore = true)
    Role toRole(RoleRequest roleRequest);
    RoleResponse toRoleResponse(Role role);
}
