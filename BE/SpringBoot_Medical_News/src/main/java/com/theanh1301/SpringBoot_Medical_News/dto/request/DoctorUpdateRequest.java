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
public class DoctorUpdateRequest {


    @Size(min = 2, max = 100, message = "SPECIALTY_INVALID")
    String specialty;


    //Integer không dùng @Size
    @Min(value = 0, message = "Số năm kinh nghiệm không được nhỏ hơn 0")
    @Max(value = 80, message = "Số năm kinh nghiệm không được lớn hơn 80")
    Integer yearsOfExperience;

    @Size(min=5 , message = "WORKPLACE_INVALID")
    String workplace;

    @Size(min=3, message ="EDUCATIONAL_LEVEL_INVALID")
    String educationalLevel;

    String introduction;
}
