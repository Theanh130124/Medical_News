package com.theanh1301.SpringBoot_Medical_News.entity;

import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Role {
    @Id
    @Size(max = 36)
    @ColumnDefault("(uuid())")
    @Column(name = "id", nullable = false, length = 36)
    String id;

    @ColumnDefault("'USER'")
    @NotNull
    @Lob
    @Column(name = "name", nullable = false)
    RoleName name;

    @Size(max = 255)
    @Column(name = "description")
    String description;

}