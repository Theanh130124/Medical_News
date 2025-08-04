package com.theanh1301.SpringBoot_Medical_News.dto.request;


import com.theanh1301.SpringBoot_Medical_News.enums.Gender;
import com.theanh1301.SpringBoot_Medical_News.validator.DobConstraint;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserUpdateRequest {

    String id;
    @Size(min=8, max=30 , message ="PASSWORD_INVALID")
    String password;

    String firstName;
    String lastName;

    @Pattern(regexp="^\\d{10}$", message="PHONENUMBER_INVALID")
    String phoneNumber;

    @Size(min=10 , message ="ADDRESS_INVALID")
    String address;

    @Size(min=10 , message = "EMAIL_INVALID")
    String email;

    Gender gender;

    MultipartFile avatar;

    @DobConstraint(min=18 , message ="INVALID_DOB")
    LocalDate dateOfBirth;
}
