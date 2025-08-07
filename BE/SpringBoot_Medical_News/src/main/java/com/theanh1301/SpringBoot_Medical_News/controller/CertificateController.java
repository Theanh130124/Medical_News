package com.theanh1301.SpringBoot_Medical_News.controller;


import com.theanh1301.SpringBoot_Medical_News.config.PaginationProperties;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CertificateResponse;
import com.theanh1301.SpringBoot_Medical_News.enums.CertificateStatus;
import com.theanh1301.SpringBoot_Medical_News.service.CertificateService;
import com.theanh1301.SpringBoot_Medical_News.utils.PaginationUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;


@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE , makeFinal = true)
@Controller
public class CertificateController {


    CertificateService certificateService;
    PaginationProperties paginationProperties;



    @GetMapping("/certificate")
    public String formCertificate(Model model , @RequestParam(defaultValue ="PENDING", value = "status", required = false) CertificateStatus status, @RequestParam(required = false) Integer page,
                                  @RequestParam(required = false)  Integer size )  {

        Pageable pageable = PaginationUtils.createPageable(page,size,paginationProperties);

        Page<CertificateResponse> certificatePage;

        certificatePage = certificateService.getCertificatesByStatus(status, pageable);
        model.addAttribute("certificate", certificatePage);
        model.addAttribute("allStatuses", CertificateStatus.values());
        model.addAttribute("selectedStatus", status);
        model.addAttribute("REJECTED", CertificateStatus.REJECTED);
        model.addAttribute("APPROVED", CertificateStatus.APPROVED);
        return "certificate";
    }

    @PostMapping("/certificate/approve/{id}")
    public String approveCertificate(@PathVariable String id) {
        CertificateUpdateRequest request = new CertificateUpdateRequest(CertificateStatus.APPROVED);
        certificateService.updateCertificate(id, request);
        return "redirect:/certificate";
    }

    @PostMapping("/certificate/reject/{id}")
    public String rejectCertificate(@PathVariable String id, @RequestParam String reason) {
        certificateService.rejectCertificate(id, reason);
        return "redirect:/certificate";
    }

}
