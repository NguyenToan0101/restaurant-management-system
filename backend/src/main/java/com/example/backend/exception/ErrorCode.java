package com.example.backend.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

@Getter
public enum ErrorCode {
    INVALID_REQUEST(1001, "Invalid request", HttpStatus.BAD_REQUEST),

    // Authentication errors (1100-1199)
    INVALID_CREDENTIALS(1101, "Invalid email or password", HttpStatus.UNAUTHORIZED),
    USER_NOT_FOUND(1102, "User not found", HttpStatus.NOT_FOUND),
    USER_INACTIVE(1103, "Account has been deactivated", HttpStatus.FORBIDDEN),
    USER_EXISTED(1104, "User already existed", HttpStatus.BAD_REQUEST),
    EMAIL_EXISTED(1105, "Email already exists", HttpStatus.BAD_REQUEST),
    USER_NOTEXISTED(1106, "User does not exist", HttpStatus.NOT_FOUND),
    PASSWORD_NOTMATCH(1107, "Password does not match", HttpStatus.BAD_REQUEST),
    UNAUTHORIZED(1108, "You do not have permission to access this resource", HttpStatus.FORBIDDEN),
    UNAUTHENTICATED(1109, "Access token is missing or invalid", HttpStatus.UNAUTHORIZED),
    
    // Role errors (1150-1159)
    ROLE_NOTEXISTED(1150, "Role does not exist", HttpStatus.NOT_FOUND),

    // JWT errors (1200-1299)
    INVALID_JWT_SIGNATURE(1201, "Invalid JWT signature", HttpStatus.UNAUTHORIZED),
    JWT_EXPIRED(1202, "Token has expired", HttpStatus.UNAUTHORIZED),
    INVALID_JWT_FORMAT(1203, "Invalid JWT format", HttpStatus.BAD_REQUEST),
    JWT_MISSING(1204, "Token not provided", HttpStatus.UNAUTHORIZED),

    // Refresh token errors (1300-1399)
    REFRESH_TOKEN_NOT_FOUND(1301, "Refresh token not found", HttpStatus.UNAUTHORIZED),
    REFRESH_TOKEN_EXPIRED(1302, "Refresh token has expired", HttpStatus.UNAUTHORIZED),
    INVALID_REFRESH_TOKEN(1303, "Invalid refresh token", HttpStatus.BAD_REQUEST),

    // Google OAuth errors (1400-1499)
    INVALID_AUTHORIZATION_CODE(1400, "Invalid or expired authorization code", HttpStatus.UNAUTHORIZED),
    GOOGLE_SERVICE_UNAVAILABLE(1401, "Google service temporarily unavailable", HttpStatus.SERVICE_UNAVAILABLE),
    INVALID_ID_TOKEN(1402, "Invalid ID token", HttpStatus.UNAUTHORIZED),
    EMAIL_NOT_VERIFIED(1403, "Email not verified on Google", HttpStatus.UNAUTHORIZED),
    USER_CANCELLED_LOGIN(1404, "User cancelled login", HttpStatus.UNAUTHORIZED),
    INVALID_STATE_PARAMETER(1405, "Invalid state parameter", HttpStatus.UNAUTHORIZED),

    //Cloudinary errors
    MEDIA_EMPTY(1501, "Media empty", HttpStatus.NOT_FOUND),
    MEDIA_UPLOAD_FAILED(1502, "Media uploaded failed", HttpStatus.INTERNAL_SERVER_ERROR),
    MEDIA_NOT_FOUND(1503, "Media not found", HttpStatus.NOT_FOUND),
    MEDIA_DELETE_FAILED(1504, "Media delete failed", HttpStatus.INTERNAL_SERVER_ERROR),
    TARGET_TYPE_NOT_FOUND(1505, "Target type not found", HttpStatus.NOT_FOUND),
    // Restaurant error
    RESTAURANT_NOTEXISTED(3000, "Restaurant not existed", HttpStatus.NOT_FOUND),
    BRANCH_NOTEXISTED(3001, "Branch not existed", HttpStatus.NOT_FOUND),
    RESTAURANT_DELETE_FAILED(3002, "Failed to delete restaurant", HttpStatus.INTERNAL_SERVER_ERROR),
    
    // Menu Item errors
    MENUITEM_NOT_FOUND(3100, "Menu item not found", HttpStatus.NOT_FOUND),
    CATEGORY_NOT_FOUND(3101, "Category not found", HttpStatus.NOT_FOUND),
    CUSTOMIZATION_NOT_FOUND(3102, "Customization not found", HttpStatus.NOT_FOUND),

    // Area & Table errors (3200-3299)
    AREA_NOT_FOUND(3200, "Area not found", HttpStatus.NOT_FOUND),
    AREA_NAME_EXISTED(3201, "Area name already exists in this branch", HttpStatus.BAD_REQUEST),
    TABLE_NOT_FOUND(3210, "Table not found", HttpStatus.NOT_FOUND),
    TABLE_TAG_EXISTED(3211, "Table tag already exists in this area", HttpStatus.BAD_REQUEST),
    INVALID_CAPACITY(3212, "Table capacity must be greater than 0", HttpStatus.BAD_REQUEST),

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