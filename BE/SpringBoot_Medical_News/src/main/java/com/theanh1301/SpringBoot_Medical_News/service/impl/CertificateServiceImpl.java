package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CertificateResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Certificate;
import com.theanh1301.SpringBoot_Medical_News.entity.Doctor;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.CertificateStatus;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.CertificateMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.CertificateRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.DoctorRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.CertificateService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.logging.Level;
import java.util.logging.Logger;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CertificateServiceImpl implements CertificateService {


    CertificateRepository certificateRepository;
    CertificateMapper certificateMapper;
    DoctorRepository doctorRepository;
    Cloudinary cloudinary;
    private final UserRepository userRepository;

    @Override
    public CertificateResponse createCertificate(CertificateCreationRequest request) {


        if (certificateRepository.existsCertificateByCertificateNumber(request.getCertificateNumber())) {
            throw new AppException(ErrorCode.CERTIFICATE_NUMBER_EXISTS);
        }

        Certificate certificate = certificateMapper.toCertificate(request);
        MultipartFile imageCertificate = request.getImageCertificate();
        if (imageCertificate != null && !imageCertificate.isEmpty()) {
            try {
                Map res = cloudinary.uploader().upload(imageCertificate.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto"));
                certificate.setImageCertificate(res.get("secure_url").toString());
            } catch (IOException ex) {
                Logger.getLogger(CertificateServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }

        }
        Doctor doctor = doctorRepository
                .findById(request.getDoctorId()).orElseThrow(() -> new AppException(ErrorCode.DOCTOR_NOT_FOUND));

        certificate.setDoctor(doctor);


        return certificateMapper.toCertificateResponse(certificateRepository.save(certificate));
    }


    //Duyệt nhận cũng cập nhật trạng thái cho doctor
    @Override
    public CertificateResponse updateCertificate(String id, CertificateUpdateRequest request) {
        Certificate certificate = certificateRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CERTIFICATE_NOT_FOUND));
        //Save lại active
        User user = certificate.getDoctor().getUser();
        user.setIsActive(true);
        userRepository.save(user);
        certificateMapper.updateCertificate(certificate, request); // map cái status

        return  certificateMapper.toCertificateResponse(certificateRepository.save(certificate));

    }


    @Override
    public Page<CertificateResponse> getCertificatesByStatus(CertificateStatus status , Pageable pageable) {
        return certificateRepository.getCertificateByStatus(status, pageable).map(certificateMapper::toCertificateResponse);

    }

    @Override
    public Page<CertificateResponse> getAllCertificates(Pageable pageable) {
        return certificateRepository.findAll(pageable).map(certificateMapper::toCertificateResponse);
    }



    @Override
    public void deleteCertificate(String id) {
        certificateRepository.deleteById(id);
    }

    @Override
    public void rejectCertificate(String id, String reason) {
        Certificate cert = certificateRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.CERTIFICATE_NOT_FOUND));
        cert.setStatus(CertificateStatus.REJECTED);

        certificateRepository.save(cert);

        User user = cert.getDoctor().getUser();



    }
}



