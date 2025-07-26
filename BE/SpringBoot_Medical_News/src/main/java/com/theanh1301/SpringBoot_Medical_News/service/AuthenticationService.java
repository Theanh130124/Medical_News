package com.theanh1301.SpringBoot_Medical_News.service;

import com.nimbusds.jose.JOSEException;
import com.nimbusds.jwt.SignedJWT;
import com.theanh1301.SpringBoot_Medical_News.dto.request.AuthenticationRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.IntrospectRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.LogoutRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.request.RefreshTokenRequest;
import com.theanh1301.SpringBoot_Medical_News.dto.response.AuthenticationResponse;
import com.theanh1301.SpringBoot_Medical_News.dto.response.IntrospectResponse;

import java.text.ParseException;
//Tuân thủ solid
public interface AuthenticationService {
    IntrospectResponse introspect(IntrospectRequest request) throws JOSEException, ParseException;
    AuthenticationResponse authenticate(AuthenticationRequest request);
    AuthenticationResponse refreshToken(RefreshTokenRequest request) throws JOSEException, ParseException;
    void logout(LogoutRequest request) throws JOSEException, ParseException;
}
