package com.theanh1301.SpringBoot_Medical_News.dto.response;


import com.theanh1301.SpringBoot_Medical_News.enums.CertificateStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateResponse {

    String id;
    DoctorResponse doctorResponse; // nếu có toUserReponse thì để mapstruct tự map đc -> xem map lai doctor
    String certificateNumber;
    LocalDate issueDate;
    LocalDate expiryDate;
    String imageCertificate;
    CertificateStatus status;

}
