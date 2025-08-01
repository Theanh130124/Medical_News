package com.theanh1301.SpringBoot_Medical_News.dto.request;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DoctorUpdateRequest {

    String specialty;
    Integer yearsOfExperience;
    String workplace;
    String educationalLevel;
    String introduction;
}
