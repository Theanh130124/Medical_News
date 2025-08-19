package com.theanh1301.SpringBoot_Medical_News.dto.response;


import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorResponseForUser {

    String id;
    String specialty;
    Integer yearsOfExperience;
    String workplace;
    String educationalLevel;
    String introduction;
}
