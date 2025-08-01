package com.theanh1301.SpringBoot_Medical_News.service.impl;

import com.theanh1301.SpringBoot_Medical_News.dto.request.DoctorUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.DoctorResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Doctor;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.DoctorMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.DoctorRepository;
import com.theanh1301.SpringBoot_Medical_News.service.DoctorService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DoctorServiceImpl implements DoctorService {

    DoctorRepository doctorRepository;
    DoctorMapper doctorMapper;

    @Override
    public DoctorResponse updateDoctor(String doctorId , DoctorUpdateRequest request) {
        Doctor doctor = doctorRepository.findById(doctorId).orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));
        doctorMapper.updateDoctor(doctor, request);
        return doctorMapper.toDoctorResponse(doctorRepository.save(doctor));
    }
}
