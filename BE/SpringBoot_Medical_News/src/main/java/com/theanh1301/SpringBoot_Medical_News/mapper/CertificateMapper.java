package com.theanh1301.SpringBoot_Medical_News.mapper;


import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateCreationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.CertificateUpdateRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.CertificateResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.Certificate;
import org.mapstruct.*;

@Mapper(componentModel = "spring" ,
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
uses = {DoctorMapper.class})  //phải có này
public interface CertificateMapper {

    @Mapping(target="doctor" , ignore = true)
    @Mapping(target = "imageCertificate" , ignore = true)
    Certificate toCertificate(CertificateCreationRequest request);



    //Trong certificate có doctorResponse -> dùng
    @Mapping(target = "doctorResponse" , source = "doctor")
    CertificateResponse toCertificateResponse(Certificate certificate);


    void updateCertificate(@MappingTarget Certificate certificate, CertificateUpdateRequest request);
}
