package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    INVALID_REQUEST(1001, "Invalid request", HttpStatus.BAD_REQUEST),

    // Authentication errors (1100-1199)
    INVALID_CREDENTIALS(1101, "Email hoặc mật khẩu không đúng", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1102, "Người dùng không tồn tại", HttpStatus.NOT_FOUND),
    USER_INACTIVE(1103, "Tài khoản đã bị vô hiệu hóa", HttpStatus.FORBIDDEN),
    USER_EXISTED(1001, "User already existed", HttpStatus.BAD_REQUEST),

    // JWT errors (1200-1299)
    INVALID_JWT_SIGNATURE(1201, "Chữ ký JWT không hợp lệ", HttpStatus.UNAUTHORIZED),
    JWT_EXPIRED(1202, "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    INVALID_JWT_FORMAT(1203, "Định dạng JWT không hợp lệ", HttpStatus.BAD_REQUEST),
    JWT_MISSING(1204, "Token không được cung cấp", HttpStatus.UNAUTHORIZED),

    // Refresh token errors (1300-1399)
    REFRESH_TOKEN_NOT_FOUND(1301, "Refresh token không tồn tại", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(1302, "Refresh token đã hết hạn", HttpStatus.UNAUTHORIZED),
    // Restaurant error
    RESTAURANT_NOTEXISTED(3000, "Restaurant not existed", HttpStatus.NOT_FOUND),
    BRANCH_NOTEXISTED(3001, "Branch not existed", HttpStatus.NOT_FOUND),
    RESTAURANT_DELETE_FAILED(3002, "Failed to delete restaurant", HttpStatus.INTERNAL_SERVER_ERROR),

    UNEXPECTED_EXCEPTION(9999, "undefined exception", HttpStatus.INTERNAL_SERVER_ERROR);

    private int code;
    private String message;
    private HttpStatusCode statusCode;

    ErrorCode(int code, String message, HttpStatusCode statusCode) {
        this.code = code;
        this.message = message;
        this.statusCode = statusCode;
    }
}