package com.theanh1301.SpringBoot_Medical_News.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;



@Getter
public enum ErrorCode {


    INVALID_KEY(1000,"Sai sót dữ liệu truyền vào", HttpStatus.BAD_REQUEST),
    UNCATEGORIZED_EXCEPTION(9998, "Chưa xác định ngoại lệ", HttpStatus.INTERNAL_SERVER_ERROR), //là error khác các error ở đây
    //Phần validate trong dto
    USER_EXISTS(1001, "Tên tài khoản đã tồn tại",HttpStatus.BAD_REQUEST),
    USERNAME_INVALID(1003,"Tên tài khoản không được nhỏ hơn {min} ký tự",HttpStatus.BAD_REQUEST),
    PASSWORD_INVALID(1004,"Mật khẩu không được nhỏ hơn {min} ký tự",HttpStatus.BAD_REQUEST),
    USER_NOT_EXISTS(1005,"User không tồn tại",HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006,"Không đăng nhập thành công",HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1006,"Không có quyền thực hiện",HttpStatus.FORBIDDEN),
    INVALID_DOB(1007 ,"Bạn phải trên {min} tuổi ",HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1008 , "Role chưa được tạo",HttpStatus.BAD_REQUEST), //gửi sai tên role
    PHONENUMBER_INVALID(1009 ,"Số điện thoại không hợp lệ, phải có đúng {min} chữ số" , HttpStatus.BAD_REQUEST),
    ADDRESS_INVALID(1010,"Địa chỉ nơi ở quá ngắn , phải dài 10 ký tự",HttpStatus.BAD_REQUEST ),
    EMAIL_INVALID(1011,"Địa chỉ email quá ngắn , phải dài hơn {min} ký tự",HttpStatus.BAD_REQUEST);

    private final int code;
    private final String msg;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String msg, HttpStatusCode statusCode) {
        this.code = code;
        this.msg = msg;
        this.statusCode = statusCode;
    }

}
