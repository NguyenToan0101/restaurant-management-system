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
    UNAUTHORIZED(1104, "Bạn không có quyền truy cập tài nguyên này", HttpStatus.FORBIDDEN),

    // JWT errors (1200-1299)
    INVALID_JWT_SIGNATURE(1201, "Chữ ký JWT không hợp lệ", HttpStatus.UNAUTHORIZED),
    JWT_EXPIRED(1202, "Token đã hết hạn", HttpStatus.UNAUTHORIZED),
    INVALID_JWT_FORMAT(1203, "Định dạng JWT không hợp lệ", HttpStatus.BAD_REQUEST),
    JWT_MISSING(1204, "Token không được cung cấp", HttpStatus.UNAUTHORIZED),

    // Refresh token errors (1300-1399)
    REFRESH_TOKEN_NOT_FOUND(1301, "Refresh token không tồn tại", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(1302, "Refresh token đã hết hạn", HttpStatus.UNAUTHORIZED),

    //Cloudinary errors
    MEDIA_EMPTY(1401, "Media empty", HttpStatus.NOT_FOUND),
    MEDIA_UPLOAD_FAILED(1402, "Media uploaded failed", HttpStatus.INTERNAL_SERVER_ERROR),
    MEDIA_NOT_FOUND(1403, "Media not found", HttpStatus.NOT_FOUND),
    MEDIA_DELETE_FAILED(1404, "Media delete failed", HttpStatus.INTERNAL_SERVER_ERROR),
    TARGET_TYPE_NOT_FOUND(1405, "Target type not found", HttpStatus.NOT_FOUND),
    // Restaurant error
    RESTAURANT_NOTEXISTED(3000, "Restaurant not existed", HttpStatus.NOT_FOUND),
    BRANCH_NOTEXISTED(3001, "Branch not existed", HttpStatus.NOT_FOUND),
    RESTAURANT_DELETE_FAILED(3002, "Failed to delete restaurant", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // Menu Item errors
    MENUITEM_NOT_FOUND(3100, "Menu item not found", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(3101, "Category not found", HttpStatus.NOT_FOUND),
    CUSTOMIZATION_NOT_FOUND(3102, "Customization not found", HttpStatus.NOT_FOUND),

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