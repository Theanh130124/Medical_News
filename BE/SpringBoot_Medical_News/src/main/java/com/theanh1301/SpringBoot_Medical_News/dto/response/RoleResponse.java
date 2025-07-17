package com.theanh1301.SpringBoot_Medical_News.dto.response;


import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.repository.PermissionRepository;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    RoleName name;
    String description;
    Set<PermissionResponse> permissions;
}
