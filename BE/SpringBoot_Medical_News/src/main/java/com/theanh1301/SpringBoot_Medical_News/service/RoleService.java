package com.theanh1301.SpringBoot_Medical_News.service;


import com.theanh1301.SpringBoot_Medical_News.dto.request.RoleRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.RoleResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.RoleMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.PermissionRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.RoleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {

    //Nữa viet tren thymeleaf
    RoleRepository roleRepository;
    RoleMapper roleMapper;
    PermissionRepository permissionRepository;

    public RoleResponse createRole(RoleRequest request) {
        Role role = roleMapper.toRole(request);

        //Tự map permission
        var permissions = permissionRepository.findAllByNameIn(request.getPermissions()); //chỉ set các permission sẳn có
        role.setPermissions(permissions);
        roleRepository.save(role);
        return roleMapper.toRoleResponse(role);
    }


    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream().map(roleMapper::toRoleResponse).collect(Collectors.toList()); //.map(role -> roleMapper.toRoleResponse(role)
    }

    public void deleteRole(String id) {
        roleRepository.deleteById(id);
    }

    public RoleResponse updateRole(String id, RoleRequest roleRequest) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROLE_NOT_FOUND));

        role.setName(roleRequest.getName());
        role.setDescription(roleRequest.getDescription());

        var permissions = permissionRepository.findAllByNameIn(roleRequest.getPermissions()); // trog json truyền [] với set
        role.setPermissions(permissions);

        roleRepository.save(role);
        return roleMapper.toRoleResponse(role);

    }


}
