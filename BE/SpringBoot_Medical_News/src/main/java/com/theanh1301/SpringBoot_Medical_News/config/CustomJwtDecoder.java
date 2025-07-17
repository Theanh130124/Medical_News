
package com.theanh1301.SpringBoot_Medical_News.config;


import com.nimbusds.jose.JOSEException;
import com.theanh1301.SpringBoot_Medical_News.dto.request.IntrospectRequest;
import com.theanh1301.SpringBoot_Medical_News.service.AuthenticationService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Component;

import javax.crypto.spec.SecretKeySpec;
import java.text.ParseException;
import java.util.Objects;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CustomJwtDecoder implements JwtDecoder {

    @Value("${jwt.signerKey}")
    @NonFinal // để không injection  -> không muốn final
    String signerKey;



    AuthenticationService authenticationService;


    @NonFinal
    NimbusJwtDecoder nimbusJwtDecoder = null ;

    @Override
    public Jwt decode(String token) throws JwtException {
        try{
            //Dùng introspect để decoder
            var response = authenticationService.introspect(IntrospectRequest.builder().token(token).build());
            if(!response.isValid())
                throw new JwtException("Token khong hop le");

        }catch (JOSEException | ParseException e){
            throw new JwtException("Token khong hop le !");

        }
        if(Objects.isNull(nimbusJwtDecoder)){

            SecretKeySpec secretKeySpec = new SecretKeySpec(signerKey.getBytes(), "HS512");
            nimbusJwtDecoder = NimbusJwtDecoder.withSecretKey(secretKeySpec).macAlgorithm(MacAlgorithm.HS512).build();

        }
        return nimbusJwtDecoder.decode(token);
    }




}