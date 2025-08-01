package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.DoctorResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Doctor;

public interface DoctorService {

    DoctorResponse updateDoctor(String doctorId , DoctorUpdateRequest request);

}
