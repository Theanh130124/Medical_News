package com.theanh1301.SpringBoot_Medical_News.service;


import com.nimbusds.jose.JOSEException;
import com.nimbusds.jose.JWSVerifier;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;
import com.theanh1301.SpringBoot_Medical_News.dto.request.AuthenticationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.IntrospectRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.AuthenticationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.IntrospectResponse;
import com.theanh1301.SpringBoot_Medical_News.exception.AppException;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import com.theanh1301.SpringBoot_Medical_News.repository.InvalidatedTokenRepository;
import com.theanh1301.SpringBoot_Medical_News.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;

import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Slf4j //tạo ra biến log
@Service
@RequiredArgsConstructor //Contructror cho field final và @NonNull
@FieldDefaults(level = AccessLevel.PRIVATE,makeFinal = true)
public class AuthenticationService {

    UserRepository userRepository;
    InvalidatedTokenRepository invalidatedTokenRepository;


    @NonFinal  // khong them final -> do minh co , makeFinal = true
    @Value("${jwt.signerKey}")
    protected String SINGER_KEY;

    @NonFinal
    @Value("${jwt.expired}")
    protected  long EXPIRED_TOKEN;

    @NonFinal
    @Value("${jwt.refreshabled}")
    protected  long REFRESHED_TOKEN;



    //Cơ chế ktra jwt khả dụng không (Hết hạn , không đúng , có trong bảng invalidated (do logout hoặc refresh )
    private SignedJWT verifyToken(String token , boolean isRefresh) throws JOSEException , ParseException {
        JWSVerifier verifier = new MACVerifier(SINGER_KEY.getBytes());
        SignedJWT signedJWT = SignedJWT.parse(token);

        //Token hết hạn chưa ? -> nếu dùng cho isRefresh thì dùng thời gian refresh còn không thì tg ExpirationTime..
        Date expityTime = (isRefresh) ? new Date(signedJWT.getJWTClaimsSet().getIssueTime().toInstant()
                .plus(REFRESHED_TOKEN, ChronoUnit.MINUTES).toEpochMilli())
                : signedJWT.getJWTClaimsSet().getExpirationTime();
        var verifiedJWT = signedJWT.verify(verifier);

        //Không đúng chữ ký hoặc hết hạn : 403
        if(!verifiedJWT && expityTime.after(new Date())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        //Nếu logout có id trong bảng invalid -> 401
        if(invalidatedTokenRepository.existsById(signedJWT.getJWTClaimsSet().getJWTID())) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }

        return signedJWT;

    }


    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        try{
            verifyToken(token ,false); // -> false vì không phải là refresh
        }catch (AppException e){

            return IntrospectResponse.builder().valid(false).build();

        }
        return IntrospectResponse.builder().valid(true).build();
    }


    // Đăng nhập tạo token
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findById(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10); //mã hóa pass
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword()); // so sánh pass
        if(!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        var token =
    }



}
