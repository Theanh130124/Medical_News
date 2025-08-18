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
    USER_NOT_EXISTS(1005,"Tài khoản không tồn tại",HttpStatus.NOT_FOUND),
    UNAUTHENTICATED(1006,"Không đăng nhập thành công",HttpStatus.UNAUTHORIZED),
    UNAUTHORIZED(1006,"Không có quyền thực hiện",HttpStatus.FORBIDDEN),
    INVALID_DOB(1007 ,"Bạn phải trên {min} tuổi ",HttpStatus.BAD_REQUEST),
    ROLE_NOT_FOUND(1008 , "Role chưa được tạo",HttpStatus.BAD_REQUEST), //gửi sai tên role
    PHONENUMBER_INVALID(1009 ,"Số điện thoại không hợp lệ, phải có đúng 10 chữ số" , HttpStatus.BAD_REQUEST),
    PHONENUMBER_EXIST(1013 , "Số điện thoại đã tồn tài", HttpStatus.BAD_REQUEST),
    ADDRESS_INVALID(1010,"Địa chỉ nơi ở quá ngắn , phải dài 10 ký tự",HttpStatus.BAD_REQUEST ),
    EMAIL_INVALID(1011,"Địa chỉ email quá ngắn , phải dài hơn {min} ký tự",HttpStatus.BAD_REQUEST),
    EMAIL_EXISTS(1012,"Địa chỉ email đã tồn tài",HttpStatus.BAD_REQUEST ),
    IS_ACTIVEFALSE(1013 ,"Trạng thái hoạt động tài khoản chưa được kích hoạt", HttpStatus.UNAUTHORIZED),
    PASSWORD_FAIL(1014, "Nhập sai mật khẩu" , HttpStatus.UNAUTHORIZED),
    NONE_YET_TOKEN(1015 , "Ban chua co token" , HttpStatus.UNAUTHORIZED),
    CERTIFICATE_NUMBER_INVALID(1016,"Mã chứng chỉ hành nghề không được ngắn hơn {min} ký tự" , HttpStatus.BAD_REQUEST),
    CERTIFICATE_NUMBER_EXISTS(1017 , "Mã chứng chỉ hành nghề đã tồn tại",HttpStatus.BAD_REQUEST ),
    NOT_ROLE_DOCTOR(1018,"Tài khoản không có quyền bác sĩ",HttpStatus.FORBIDDEN),
    POST_NOT_FOUND(1019, "Không tìm thấy bài viết" , HttpStatus.BAD_REQUEST),
    COMMENT_NOT_FOUND(1020, "Không tìm thấy commment", HttpStatus.BAD_REQUEST),
    COMMENT_LOCKED(1021,"Bài viết đã khóa comment",HttpStatus.FORBIDDEN),
    REACTION_NOT_FOUND(1022,"Không tìm thấy reaction" ,HttpStatus.BAD_REQUEST),
    FOLLOW_INVALID(1023,"Không thể tự follow " , HttpStatus.BAD_REQUEST),
    FOLLOW_ALREADY(1024,"Bạn đã follow người này" , HttpStatus.BAD_REQUEST),
    FOLLOW_NOT_FOUND(1025,"Bạn chưa follow người này" , HttpStatus.NOT_FOUND),
    SPECIALTY_INVALID(1026,"Tên chuyên khoa không hợp lệ, không ngắn hơn {min} ký tự",HttpStatus.BAD_REQUEST),
    WORKPLACE_INVALID(1027,"Nợi làm việc không ngắn hơn {min} ký tự", HttpStatus.BAD_REQUEST),
    EDUCATIONAL_LEVEL_INVALID(1028,"Trình độ học vấn không hợp lệ ,phải lớn hơn {min} ký tư",HttpStatus.BAD_REQUEST),
    DOCTOR_NOT_FOUND(1029 , "Không tìm thấy bác sĩ" , HttpStatus.BAD_REQUEST),
    CERTIFICATE_NOT_FOUND(1030,"Không tìm thấy chứng chỉ hành nghề" , HttpStatus.BAD_REQUEST),
    STATS_YEAR_VALIDATED(1031,"Nếu chọn tháng hoặc quý thì bắt buộc phải có năm" , HttpStatus.BAD_REQUEST),
    STATS_MONTH_QUARTER_VALID(1032,"Không thể lọc cả tháng và quý cùng lúc",HttpStatus.BAD_REQUEST),
    FRIEND_INVALID(1033,"Không thể tự kết bạn với chính mình",HttpStatus.BAD_REQUEST),
    FRIEND_ALREADY_EXISTS(1034,"Đã gửi lời mời kết bạn hãy chờ xác nhận",HttpStatus.BAD_REQUEST),
    FRIEND_NOT_FOUND(1035,"Không tìm thấy lời mời kết bạn", HttpStatus.BAD_REQUEST),
    SURVEY_OPTION_NOT_FOUND(1036,"Không tìm thấy lựa chọn khảo sát", HttpStatus.BAD_REQUEST),
    ALREADY_VOTED(1037,"Bạn đã chọn phương án này rồi", HttpStatus.BAD_REQUEST),
    NOTIFICATION_NOT_FOUND(1038,"Không tìm thấy thông báo", HttpStatus.BAD_REQUEST);
    private final int code;
    private final String msg;
    private final HttpStatusCode statusCode;

    ErrorCode(int code, String msg, HttpStatusCode statusCode) {
        this.code = code;
        this.msg = msg;
        this.statusCode = statusCode;
    }

}
