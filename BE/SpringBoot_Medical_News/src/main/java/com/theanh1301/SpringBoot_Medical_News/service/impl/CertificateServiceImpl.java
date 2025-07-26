package com.theanh1301.SpringBoot_Medical_News.service.impl;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CertificateResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Certificate;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
import com.theanh1301.SpringBoot_Medical_News.enums.RoleName;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.mapper.CertificateMapper;
import com.theanh1301.SpringBoot_Medical_News.repository.CertificateRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import com.theanh1301.SpringBoot_Medical_News.service.CertificateService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
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
    UserRepository userRepository;
    Cloudinary cloudinary;


    public CertificateResponse createCertificate(CertificateCreationRequest request){


        if(certificateRepository.existsCertificateByCertificateNumber(request.getCertificateNumber())){
            throw new AppException(ErrorCode.CERTIFICATE_NUMBER_EXISTS);
        }

        Certificate certificate = certificateMapper.toCertificate(request);
        MultipartFile  imageCertificate = request.getImageCertificate();
        if (imageCertificate != null && !imageCertificate.isEmpty()) {
            try{
                Map res = cloudinary.uploader().upload(imageCertificate.getBytes(),
                        ObjectUtils.asMap("resource_type", "auto"));
                certificate.setImageCertificate(res.get("secure_url").toString());
            }catch (IOException ex){
                Logger.getLogger(CertificateServiceImpl.class.getName()).log(Level.SEVERE, null, ex);
            }

        }
        User user = userRepository.findById(request.getUserId()).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        if(!user.getRole().getName().equals(RoleName.DOCTOR)){
            throw new AppException(ErrorCode.NOT_ROLE_DOCTOR);
        }
        certificate.setUser(user);


        return certificateMapper.toCertificateResponse(certificateRepository.save(certificate));
    }
}
