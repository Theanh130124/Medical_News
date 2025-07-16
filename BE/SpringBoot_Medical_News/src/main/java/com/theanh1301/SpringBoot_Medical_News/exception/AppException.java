package com.theanh1301.SpringBoot_Medical_News.exception;


//thay thê RuntimeException


import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AppException extends RuntimeException {

    private ErrorCode errorCode;


    public AppException(ErrorCode errorCode) {
        super(errorCode.getMsg()); // sẽ gửi msg từ AppException (con) -> lên RuntimeException (cha)
        this.errorCode = errorCode;
    }

}
