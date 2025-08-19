package com.theanh1301.SpringBoot_Medical_News.dto.response;


import com.theanh1301.SpringBoot_Medical_News.enums.Gender;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {

    String id;
    String username;
    //không trả pass
    String firstName;
    String lastName;
    String phoneNumber;
    Boolean isActive;
    String address;
    String email;
    Gender gender;
    String avatar;
    LocalDate dateOfBirth;
    RoleResponse role;
    Instant createdAt;
    DoctorResponseForUser doctor;

}
