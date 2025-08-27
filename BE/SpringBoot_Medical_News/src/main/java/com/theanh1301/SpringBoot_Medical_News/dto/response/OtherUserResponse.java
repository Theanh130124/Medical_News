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
public class OtherUserResponse {

    String id;
    //không trả pass
    String firstName;
    String lastName;
    Boolean isActive;
    String address;
    Gender gender;
    String avatar;
    LocalDate dateOfBirth;
    RoleResponse role;
    Instant createdAt;
    DoctorResponseForUser doctor;
}
