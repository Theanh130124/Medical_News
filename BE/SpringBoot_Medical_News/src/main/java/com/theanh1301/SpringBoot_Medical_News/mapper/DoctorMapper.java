package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.DoctorResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Doctor;
import org.mapstruct.*;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface DoctorMapper {

    @Mapping(target ="user", ignore = true)
    Doctor toDoctor(DoctorCreationRequest request);


    @Mapping(target = "userResponse" , source = "user")
    DoctorResponse toDoctorResponse(Doctor doctor);

    void updateDoctor(@MappingTarget Doctor doctor, DoctorUpdateRequest request);
}
