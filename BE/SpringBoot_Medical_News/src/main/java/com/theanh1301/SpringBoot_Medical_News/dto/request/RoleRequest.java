package com.theanh1301.SpringBoot_Medical_News.dto.request;


import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleRequest {
    RoleName name;
    String description;
    //Tại vì người dùng không thể truyền một object
    Set<String> permissions;
}
