package com.theanh1301.SpringBoot_Medical_News.dto.request;


import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.enums.Gender;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.validator.DobConstraint;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserCreationRequest
{
    @Size(min=3 , max=30 , message = "USERNAME_INVALID")
    String username;

    @Size(min=8, max=30 , message ="PASSWORD_INVALID")
    String password;

    String firstName;
    String lastName;

    @Pattern(regexp="^\\d{10}$", message="PHONENUMBER_INVALID")
    String phoneNumber;

    //Tên message -> trong @Size là phải có trong exception của mình
    //-> Vì GlobalExceptionHanlder sẽ lấy thông tin min max dựa và tên message
    @Size(min=10 , message ="ADDRESS_INVALID")
    String address;
    Gender gender;

    @Size(min=10 , message = "EMAIL_INVALID")
    String email;

    String avatar;
    //ảnh bìa khỏi
    //bio khỏi

    @DobConstraint(min=18 , message ="INVALID_DOB")
    LocalDate dateOfBirth;

    //request chỉ cần truyền tên role
    RoleName role;
}
