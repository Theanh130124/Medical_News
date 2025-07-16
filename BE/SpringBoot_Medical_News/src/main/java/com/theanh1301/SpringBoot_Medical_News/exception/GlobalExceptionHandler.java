package com.theanh1301.SpringBoot_Medical_News.exception;


import lombok.experimental.StandardException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ControllerAdvice;

@Slf4j
@ControllerAdvice // hàm dùng chung
public class GlobalExceptionHandler {

    private static final  String MIN_ATTRIBUTE = "min"; // biên validate -> nếu có max thêm max



}
