package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.RoleRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.RoleResponse;

import java.util.List;

public interface RoleService {
    RoleResponse createRole(RoleRequest request);
    List<RoleResponse> getAllRoles();
    void deleteRole(String id);
    RoleResponse updateRole(String id, RoleRequest roleRequest);

}
