package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable // đánh dấu 1 entity đc nhúng tu bảng khác
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RolePermissionId implements Serializable {
    static final long serialVersionUID = -5975689627162951746L;
    @Size(max = 36)
    @NotNull
    @Column(name = "role_id", nullable = false, length = 36)
    String roleId;

    @Size(max = 36)
    @NotNull
    @Column(name = "permission_id", nullable = false, length = 36)
    String permissionId;


}