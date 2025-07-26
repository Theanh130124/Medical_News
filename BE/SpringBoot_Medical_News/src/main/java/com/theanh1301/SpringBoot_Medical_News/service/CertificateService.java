package com.theanh1301.SpringBoot_Medical_News.service;

import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CertificateResponse;

public interface CertificateService {
    CertificateResponse createCertificate(CertificateCreationRequest request);

}
