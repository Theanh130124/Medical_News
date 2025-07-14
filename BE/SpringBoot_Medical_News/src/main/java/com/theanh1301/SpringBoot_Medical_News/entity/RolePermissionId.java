package com.theanh1301.SpringBoot_Medical_News.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.Hibernate;

import java.io.Serializable;
import java.util.Objects;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Embeddable // đánh dấu 1 entity đc nhúng tu bảng khác
public class RolePermissionId implements Serializable {
    private static final long serialVersionUID = -5975689627162951746L;
    @Size(max = 36)
    @NotNull
    @Column(name = "role_id", nullable = false, length = 36)
    private String roleId;

    @Size(max = 36)
    @NotNull
    @Column(name = "permission_id", nullable = false, length = 36)
    private String permissionId;

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || Hibernate.getClass(this) != Hibernate.getClass(o)) return false;
        RolePermissionId entity = (RolePermissionId) o;
        return Objects.equals(this.permissionId, entity.permissionId) &&
                Objects.equals(this.roleId, entity.roleId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(permissionId, roleId);
    }

}