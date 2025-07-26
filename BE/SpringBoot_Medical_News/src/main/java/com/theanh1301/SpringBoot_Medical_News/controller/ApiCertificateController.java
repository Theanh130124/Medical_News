package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CertificateResponse;
import com.theanh1301.SpringBoot_Medical_News.service.CertificateService;
import com.theanh1301.SpringBoot_Medical_News.service.impl.CertificateServiceImpl;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/certificate")
public class ApiCertificateController {


     CertificateService certificateService;


    @PostMapping
    public ApiResponse<CertificateResponse> createCertificate(@ModelAttribute @Valid CertificateCreationRequest request){

        return ApiResponse.<CertificateResponse>builder()
                .result(certificateService.createCertificate(request))
                .message("Gửi chứng chỉ hành nghề thành công")
                .build();
    }





}
