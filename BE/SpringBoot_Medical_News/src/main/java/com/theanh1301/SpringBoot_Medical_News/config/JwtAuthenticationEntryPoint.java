package com.theanh1301.SpringBoot_Medical_News.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import com.theanh1301.SpringBoot_Medical_News.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;

import java.io.IOException;


//Để lỗi jwt -> trả ra 401 theo Error code có msg
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    //Ghi đè lại entrypoint
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response , AuthenticationException authException) throws IOException  {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        response.setStatus(errorCode.getStatusCode().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        //Ghi theo msg của mình
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder().code(errorCode.getCode()).message(errorCode.getMsg()).build();

        ObjectMapper mapper = new ObjectMapper();

        //viết nd vào response

        response.getWriter().write(mapper.writeValueAsString(apiResponse));
        response.flushBuffer(); // commit





    }

}
