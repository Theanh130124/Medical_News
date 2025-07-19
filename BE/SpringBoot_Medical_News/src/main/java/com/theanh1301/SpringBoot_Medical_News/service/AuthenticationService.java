package com.theanh1301.SpringBoot_Medical_News.service;


import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import com.theanh1301.SpringBoot_Medical_News.dto.request.AuthenticationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.IntrospectRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.LogoutRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.RefreshTokenRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.AuthenticationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.IntrospectResponse;
import com.theanh1301.SpringBoot_Medical_News.entity.InvalidatedToken;
import com.theanh1301.SpringBoot_Medical_News.entity.Permission;
import com.theanh1301.SpringBoot_Medical_News.entity.Role;
import com.theanh1301.SpringBoot_Medical_News.entity.User;
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
import org.springframework.util.CollectionUtils;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.text.ParseException;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.StringJoiner;
import java.util.UUID;

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
    //Trong scope thì vẫn còn ROLE_ADMIN , CREATE_POST ...  , trong grantedAuthority -> không có tiền tố ROLE_
    //build cho scope của token(jwt) chúa role và permission  -> muốn xem scope lên service xem luôn (khoongg xem ở current_user đc
    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" "); //ngăn cách nhau bởi dấu cách
        Role role = user.getRole();
        if (role != null) // Không empty -> lấy role ra

            //Thêm tiền tố ROLE_ và permission mình để trống (để dễ phân biệt)
            stringJoiner.add("ROLE_" + role.getName()); // add role và scope

        if (role.getRolePermissions() != null && !CollectionUtils.isEmpty(role.getRolePermissions())) {
            role.getRolePermissions().forEach(rolePermission ->
            {
                Permission permission = rolePermission.getPermission();
                if (permission != null) {
                    stringJoiner.add(permission.getName()); // Add permisson vào scope
                }

            });

        }
        return stringJoiner.toString();
    }




    //Tạo ra token của JWT
    private String generateToken(User user){
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        //build payload
        JWTClaimsSet jwtclaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getUsername()) //user đăng nhập vào
                .issuer("devtheanh.com")
                .issueTime(new Date()) // thời gian đăng ký
                .expirationTime(new Date(Instant.now().plus(EXPIRED_TOKEN, ChronoUnit.MINUTES).toEpochMilli())) // thời hạn token sau 1 giờ
                .claim("scope", buildScope(user)) //builder ROLE và PERMISSION vào scope
                .jwtID(UUID.randomUUID().toString())
                .build();


        Payload payload = new Payload(jwtclaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header,payload);

        //Ký token
        try{
            jwsObject.sign(new MACSigner(SINGER_KEY.getBytes()));
            return jwsObject.serialize();
        }catch (JOSEException e){
            log.error("Không thể tạo token lỗi:",e);
            throw new RuntimeException(e);
        }

    }



    //Dùng introspect để decoder
    public IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException {
        var token = request.getToken();
        try{
            verifyToken(token ,false); // -> false vì không phải là refresh
        }catch (AppException e){

            return IntrospectResponse.builder().valid(false).build();

        }
        return IntrospectResponse.builder().valid(true).build();
    }


    // Đăng nhập và tạo token
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        var user = userRepository.findById(request.getUsername())
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(10); //mã hóa pass
        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword()); // so sánh pass
        if(!authenticated) {
            throw new AppException(ErrorCode.UNAUTHENTICATED);
        }
        var token = generateToken(user);


        return AuthenticationResponse.builder().token(token).authenticated(true).build();//trả token và đăng nhập oke
    }


    //refresh lại token
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) throws JOSEException, ParseException {

        var singedJWT = verifyToken(request.getToken(),true); // là refresh nên để là true
        String jit = singedJWT.getJWTClaimsSet().getJWTID();
        Date expiryTime = singedJWT.getJWTClaimsSet().getExpirationTime(); // ngày hết hạn



        //Lưu vào bảng invalid -> để vô hiệu hóa token này

        InvalidatedToken invalidatedToken = InvalidatedToken.builder().id(jit).expiryTime(expiryTime).build();
        invalidatedTokenRepository.save(invalidatedToken);


        //Tạo token mới dựa vào username(không cần pass vì vừa mới xác thực token ở trên)
        var username = singedJWT.getJWTClaimsSet().getSubject();
        var user = userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
        var token = generateToken(user);


        return AuthenticationResponse.builder().token(token).authenticated(true).build(); // trả ra token và OKE

    }


    //Logout save token vào trong invalidatedToken
    public void logout(LogoutRequest request) throws JOSEException, ParseException {
        try{
            var signToken = verifyToken(request.getToken(), false);
            //lấy jwtTokenID
            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();
            InvalidatedToken invalidatedToken =  InvalidatedToken.builder()
                    .id(jit).expiryTime(expiryTime).build();
            invalidatedTokenRepository.save(invalidatedToken);

        }catch (AppException e){
            log.info("Token trong logout có lỗi",e);
        }
    }

}
