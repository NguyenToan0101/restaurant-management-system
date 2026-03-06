package com.example.backend.controller;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.LogoutRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.services.AuthenticationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthenticationController {

    private final AuthenticationService authenticationService;
    private final com.example.backend.repositories.UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Login request received for email: {}", request.getEmail());
        log.info("Scheme: {}", httpRequest.getScheme());
        log.info("X-Forwarded-Proto: {}", httpRequest.getHeader("X-Forwarded-Proto"));
        log.info("ServerName: {}", httpRequest.getServerName());
        log.info("RequestURL: {}", httpRequest.getRequestURL());

        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);

        AuthenticationResponse authResponse = authenticationService.login(request, clientIp, userAgent);

        // Set JWT tokens in HttpOnly cookies
        setAuthCookies(httpRequest, httpResponse, authResponse);

        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Login successful");
        response.setResult(authResponse);

        log.info("Login successful for email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refresh(
            @Valid @RequestBody(required = false) RefreshRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Refresh token request received");

        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);

        // Get refresh token from request body or cookie
        String refreshToken = getRefreshTokenFromRequestOrCookie(request, httpRequest);

        if (refreshToken == null) {
            throw new com.example.backend.exception.AppException(
                    com.example.backend.exception.ErrorCode.INVALID_REFRESH_TOKEN);
        }

        RefreshRequest refreshRequest = new RefreshRequest();
        refreshRequest.setRefreshToken(refreshToken);

        AuthenticationResponse authResponse = authenticationService.refreshToken(refreshRequest, clientIp, userAgent);

        // Set new JWT tokens in HttpOnly cookies
        setAuthCookies(httpRequest, httpResponse, authResponse);

        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Token refreshed successfully");
        response.setResult(authResponse);

        log.info("Token refresh successful");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody(required = false) LogoutRequest request,
            HttpServletRequest httpRequest,
            HttpServletResponse httpResponse) {
        log.info("Logout request received");

        // Get refresh token from request body or cookie
        String refreshToken = null;
        if (request != null && request.getRefreshToken() != null) {
            refreshToken = request.getRefreshToken();
        } else {
            refreshToken = getTokenFromCookie(httpRequest, "refresh_token");
        }

        if (refreshToken != null) {
            authenticationService.logout(refreshToken);
        }

        // Clear authentication cookies
        clearAuthCookies(httpRequest, httpResponse);

        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Logout successful");

        log.info("Logout successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<com.example.backend.dto.response.UserDTO>> getCurrentUser() {
        log.info("Get current user request received");

        // Get authenticated user from SecurityContext
        org.springframework.security.core.Authentication authentication = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() ||
                authentication.getPrincipal().equals("anonymousUser")) {
            throw new com.example.backend.exception.AppException(
                    com.example.backend.exception.ErrorCode.UNAUTHENTICATED);
        }

        com.example.backend.entities.User userFromContext = (com.example.backend.entities.User) authentication
                .getPrincipal();

        // Fetch user from database to ensure role is loaded within transaction
        com.example.backend.entities.User user = userRepository
                .findById(userFromContext.getUserId())
                .orElseThrow(() -> new com.example.backend.exception.AppException(
                        com.example.backend.exception.ErrorCode.USER_NOT_FOUND));

        com.example.backend.dto.response.UserDTO userDTO = new com.example.backend.dto.response.UserDTO(
                user.getUserId(),
                user.getEmail(),
                user.getUsername(),
                null, // phone
                user.getRole().getName().name());

        ApiResponse<com.example.backend.dto.response.UserDTO> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("User retrieved successfully");
        response.setResult(userDTO);

        log.info("Current user retrieved successfully: {}", user.getEmail());
        return ResponseEntity.ok(response);
    }

    // Helper methods

    private void setAuthCookies(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationResponse authResponse) {

        boolean isProduction = request.isSecure() ||
                "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

        // Access token cookie
        Cookie accessTokenCookie = new Cookie("access_token", authResponse.getAccessToken());
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(isProduction);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(3600); // 1 hour
        accessTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessTokenCookie);

        // Refresh token cookie
        Cookie refreshTokenCookie = new Cookie("refresh_token", authResponse.getRefreshToken());
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(isProduction);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(604800); // 7 days
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshTokenCookie);

        log.info("Set authentication cookies successfully. Production: {}", isProduction);
    }

    private void clearAuthCookies(
            HttpServletRequest request,
            HttpServletResponse response) {

        boolean isProduction = request.isSecure() ||
                "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));

        Cookie accessTokenCookie = new Cookie("access_token", null);
        accessTokenCookie.setHttpOnly(true);
        accessTokenCookie.setSecure(isProduction);
        accessTokenCookie.setPath("/");
        accessTokenCookie.setMaxAge(0);
        accessTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(accessTokenCookie);

        Cookie refreshTokenCookie = new Cookie("refresh_token", null);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setSecure(isProduction);
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setMaxAge(0);
        refreshTokenCookie.setAttribute("SameSite", "Lax");
        response.addCookie(refreshTokenCookie);

        log.info("Cleared authentication cookies. Production: {}", isProduction);
    }

    private String getRefreshTokenFromRequestOrCookie(RefreshRequest request, HttpServletRequest httpRequest) {
        if (request != null && request.getRefreshToken() != null) {
            return request.getRefreshToken();
        }
        return getTokenFromCookie(httpRequest, "refresh_token");
    }

    private String getTokenFromCookie(HttpServletRequest request, String cookieName) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookieName.equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private String extractClientIp(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getHeader("X-Real-IP");
        }
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        if (clientIp != null && clientIp.contains(",")) {
            clientIp = clientIp.split(",")[0].trim();
        }
        return clientIp;
    }

    private String extractUserAgent(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        return userAgent != null ? userAgent : "Unknown";
    }
}
