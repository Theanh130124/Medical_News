package com.theanh1301.SpringBoot_Medical_News.exception;


import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import com.theanh1301.SpringBoot_Medical_News.dto.response.ApiResponse;
import jakarta.validation.ConstraintViolation;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;


import java.nio.file.AccessDeniedException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;


//Xử lý mấy cái exception bên API cua @Valid va ben request
@Slf4j
@ControllerAdvice // hàm dùng chung
public class GlobalExceptionHandler {

    private static final String MIN_ATTRIBUTE = "min"; // biên validate -> nếu có max thêm max
    private static final String MAX_ATTRIBUTE = "max";

    //Không phải là exception đã bắt
    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleException(Exception ex) {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.UNCATEGORIZED_EXCEPTION.getCode()); // lỗi không phải lỗi đã ĐN
        apiResponse.setMessage(ex.getMessage());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiResponse);
    }

    //Bật exception dành chon AppEx.. (để lỗi từ api nó hiện ex của mình)
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleException(AppException myexception) {
        ErrorCode errorCode = myexception.getErrorCode();
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMsg());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }

    //Replace min  , max (nếu có)  trong msg -> vào @Size(min , max)
    private String mapAttribute(String msg, Map<String, Object> attributes) {
        Object min = attributes.get(MIN_ATTRIBUTE);
        if (min != null) {
            msg = msg.replace("{" + MIN_ATTRIBUTE + "}", min.toString());
        }
        Object max = attributes.get(MAX_ATTRIBUTE);
        if (max != null) {
            msg = msg.replace("{" + MAX_ATTRIBUTE + "}", max.toString());
        }
        return msg;
    }

    //Xử lý in ra msg cho Validate @Size , @Dob ....
    @ExceptionHandler(value = MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleException(MethodArgumentNotValidException exception) {
        String enumKey = exception.getFieldError().getDefaultMessage(); //tên message trong @Size
        ErrorCode errorCode = ErrorCode.INVALID_KEY; //nếu mà không tìm đc thì lỗi vậy -> không đúng msg
        Map<String, Object> attributes = null; //key là null
        try {
            errorCode = ErrorCode.valueOf(enumKey); //lấy key theo msg
            //Xử lý việc lấy params trong exception
            var constrainViolation = exception.getBindingResult().getAllErrors()
                    .getFirst()
                    .unwrap(ConstraintViolation.class);
            attributes = constrainViolation.getConstraintDescriptor().getAttributes();
            log.info(attributes.toString());
        } catch (IllegalArgumentException e) {
            log.warn("Không tìm thấy ErrorCode cho enumKey: {}", enumKey, e);
        }
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(Objects.nonNull(attributes) ?
                mapAttribute(errorCode.getMsg(), attributes) :
                errorCode.getMsg());
        return ResponseEntity.badRequest().body(apiResponse);

    }


    //Phần exception 403 cho API
    @ExceptionHandler(value = AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Void>> handleException(AccessDeniedException exception) {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED; //default
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMsg());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }



    }



