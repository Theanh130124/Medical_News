package com.theanh1301.SpringBoot_Medical_News.repository;

import com.theanh1301.SpringBoot_Medical_News.entity.Certificate;
import com.theanh1301.SpringBoot_Medical_News.enums.CertificateStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface CertificateRepository extends JpaRepository<Certificate,String> {

    boolean existsCertificateByCertificateNumber(String certificateNumber);


    @Query(value ="SELECT c FROM Certificate c WHERE c.status = :status",
            countQuery = "SELECT Count(c) FROM Certificate  c where  c.status = :status")
    Page<Certificate> getCertificateByStatus(@Param("status") CertificateStatus status, Pageable pageable);
}
