package com.theanh1301.SpringBoot_Medical_News.dto.request;


import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DoctorCreationRequest {
    String userId;

    @Size(min = 2, max = 100, message = "SPECIALTY_INVALID")
    String specialty;



    @Min(value = 0, message = "Số năm kinh nghiệm không được nhỏ hơn 0")
    @Max(value = 60, message = "Số năm kinh nghiệm không được lớn hơn 60")
    Integer yearsOfExperience;

    @Size(min=5 , message = "WORKPLACE_INVALID")
    String workplace;

    @Size(min=3, message ="EDUCATIONAL_LEVEL_INVALID")
    String educationalLevel;

    String introduction;
}
