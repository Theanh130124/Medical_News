package com.theanh1301.SpringBoot_Medical_News.entity;

import com.theanh1301.SpringBoot_Medical_News.enums.Gender;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.ColumnDefault;

import java.time.Instant;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User {
    @Id
    @Size(max = 36)
    @ColumnDefault("(uuid())")
    @Column(name = "id", nullable = false, length = 36)
    String id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "role_id", nullable = false)
    Role role;

    @Size(max = 50)
    @NotNull
    @Column(name = "username", nullable = false, length = 50)
    String username;

    @Size(max = 100)
    @NotNull
    @Column(name = "first_name", nullable = false, length = 100)
    String firstName;

    @Size(max = 100)
    @NotNull
    @Column(name = "last_name", nullable = false, length = 100)
    String lastName;

    @Size(max = 20)
    @NotNull
    @Column(name = "phone_number", nullable = false, length = 20)
    String phoneNumber;

    @NotNull
    @Lob
    @Column(name = "address", nullable = false)
    String address;

    @Lob
    @ColumnDefault("'MALE'")
    @Column(name = "gender")
    Gender gender;

    @Column(name = "date_of_birth")
    LocalDate dateOfBirth;

    @Size(max = 100)
    @NotNull
    @Column(name = "email", nullable = false, length = 100)
    String email;

    @Size(max = 255)
    @NotNull
    @Column(name = "password", nullable = false)
    String password;

    @Size(max = 255)
    @NotNull
    @Column(name = "avatar", nullable = false)
    String avatar;

    @Size(max = 255)
    @Column(name = "cover_image")
    String coverImage;

    @Lob
    @Column(name = "bio")
    String bio;

    @ColumnDefault("1")
    @Column(name = "is_active")
    Boolean isActive;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "created_at")
    Instant createdAt;

    @ColumnDefault("CURRENT_TIMESTAMP")
    @Column(name = "updated_at")
    Instant updatedAt;

}