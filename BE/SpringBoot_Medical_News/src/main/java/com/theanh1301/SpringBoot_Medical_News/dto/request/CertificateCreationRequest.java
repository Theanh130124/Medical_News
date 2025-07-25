package com.theanh1301.SpringBoot_Medical_News.dto.request;


import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;


@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateCreationRequest {



    String userId; // tự map thành user

    //Bên API phải có @Valid -> @Size mới hđ
    @Size(min=5, max=30 , message="CERTIFICATE_NUMBER_INVALID")
    String certificateNumber;

    LocalDate issueDate;
    LocalDate expiryDate;
    MultipartFile imageCertificate; // không map

}
