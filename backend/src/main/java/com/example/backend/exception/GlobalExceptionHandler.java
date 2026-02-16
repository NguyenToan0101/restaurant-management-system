package com.example.backend.exception;

import com.example.backend.dto.response.ApiResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(JwtAuthenticationException.class)
    public ResponseEntity<ApiResponse<Void>> handleJwtAuthenticationException(JwtAuthenticationException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ex.getErrorCode().getCode());
        response.setMessage(ex.getErrorCode().getMessage());
        return ResponseEntity
                .status(ex.getErrorCode().getStatusCode())
                .body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentialsException(BadCredentialsException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ErrorCode.INVALID_CREDENTIALS.getCode());
        response.setMessage(ErrorCode.INVALID_CREDENTIALS.getMessage());
        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(response);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEntityNotFoundException(EntityNotFoundException ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(HttpStatus.NOT_FOUND.value());
        response.setMessage(ex.getMessage() != null ? ex.getMessage() : "Resource not found");
        return ResponseEntity
                .status(HttpStatus.NOT_FOUND)
                .body(response);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        ApiResponse<Map<String, String>> response = new ApiResponse<>();
        response.setCode(ErrorCode.INVALID_REQUEST.getCode());
        response.setMessage("Validation failed");
        response.setResult(errors);
        
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleGenericException(Exception ex) {
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(ErrorCode.UNEXPECTED_EXCEPTION.getCode());
        response.setMessage(ErrorCode.UNEXPECTED_EXCEPTION.getMessage());
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(response);
    }
}
