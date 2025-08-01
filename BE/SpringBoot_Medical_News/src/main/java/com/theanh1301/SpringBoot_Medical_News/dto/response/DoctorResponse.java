package com.theanh1301.SpringBoot_Medical_News.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorResponse {

    UserResponse userResponse;
    String specialty;
    Integer yearsOfExperience;
    String workplace;
    String educationalLevel;
    String introduction;


}
