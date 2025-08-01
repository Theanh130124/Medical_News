package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.DoctorResponse;
import com.theanh1301.SpringBoot_Medical_News.service.DoctorService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
@FieldDefaults(level= AccessLevel.PRIVATE , makeFinal=true)
public class ApiDoctorController {

    DoctorService doctorService;


    @PostAuthorize("returnObject.result.userResponse.username == authentication.name")
    @PatchMapping("/{doctorId}")
    public ApiResponse<DoctorResponse> updateDoctor(@PathVariable String doctorId , @RequestBody @Valid DoctorUpdateRequest request){
        var res =  doctorService.updateDoctor(doctorId, request);
        return ApiResponse.<DoctorResponse>builder().result(res).message("Cập nhật thông tin bác sĩ thành công").build();
    }
}
