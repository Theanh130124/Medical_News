package com.theanh1301.SpringBoot_Medical_News.dto.request;


import com.theanh1301.SpringBoot_Medical_News.enums.CertificateStatus;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CertificateUpdateRequest {



    CertificateStatus certificateStatus;


}
