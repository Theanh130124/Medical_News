package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CertificateResponse;
import com.theanh1301.SpringBoot_Medical_News.enums.CertificateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public interface CertificateService {
    CertificateResponse createCertificate(CertificateCreationRequest request);
    CertificateResponse updateCertificate(String id , CertificateUpdateRequest request);
    Page<CertificateResponse> getCertificatesByStatus(CertificateStatus status , Pageable pageable);
    Page<CertificateResponse> getAllCertificates(Pageable pageable);
    void deleteCertificate(String id);
    void rejectCertificate(String id, String reason);
    }
