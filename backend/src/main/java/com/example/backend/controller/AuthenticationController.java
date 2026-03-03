package com.example.backend.controller;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.LogoutRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.GoogleAuthUrlResponse;
import com.example.backend.mapper.TokenMapper;
import com.example.backend.services.AuthenticationService;
import com.example.backend.services.GoogleOAuthService;
import jakarta.servlet.http.HttpServletRequest;
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
    private final GoogleOAuthService googleOAuthService;
    private final TokenMapper tokenMapper;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Login request received for email: {}", request.getEmail());
        
        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);
        
        AuthenticationResponse authResponse = authenticationService.login(request, clientIp, userAgent);
        
        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Login successful");
        response.setResult(authResponse);
        
        log.info("Login successful for email: {}", request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthenticationResponse>> refresh(
            @Valid @RequestBody RefreshRequest request,
            HttpServletRequest httpRequest
    ) {
        log.info("Refresh token request received");
        
        String clientIp = extractClientIp(httpRequest);
        String userAgent = extractUserAgent(httpRequest);
        
        AuthenticationResponse authResponse = authenticationService.refreshToken(request, clientIp, userAgent);
        
        ApiResponse<AuthenticationResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Token refreshed successfully");
        response.setResult(authResponse);
        
        log.info("Token refresh successful");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody LogoutRequest request
    ) {
        log.info("Logout request received");
        
        authenticationService.logout(request.getRefreshToken());
        
        ApiResponse<Void> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Logout successful");
        
        log.info("Logout successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/google/url")
    public ResponseEntity<ApiResponse<GoogleAuthUrlResponse>> getGoogleAuthUrl() {
        log.info("Google OAuth authorization URL request received");
        
        GoogleAuthUrlResponse authUrlResponse = googleOAuthService.generateAuthorizationUrl();
        
        ApiResponse<GoogleAuthUrlResponse> response = new ApiResponse<>();
        response.setCode(200);
        response.setMessage("Google OAuth URL generated successfully");
        response.setResult(authUrlResponse);
        
        log.info("Google OAuth authorization URL generated successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> googleCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpServletRequest httpRequest
    ) {
        log.info("Google OAuth callback request received");
        
        try {
            String clientIp = extractClientIp(httpRequest);
            String userAgent = extractUserAgent(httpRequest);
            
            // Authenticate with Google
            var user = googleOAuthService.authenticateWithGoogle(code, state);
            
            // Map to JWT tokens
            AuthenticationResponse authResponse = tokenMapper.mapToJwtTokens(user, clientIp, userAgent);
            
            // Redirect to frontend with tokens in URL (will be handled by frontend)
            String frontendUrl = String.format(
                "%s/auth/google/callback?access_token=%s&refresh_token=%s",
                System.getenv("FRONTEND_BASE_URL"),
                authResponse.getAccessToken(),
                authResponse.getRefreshToken()
            );
            
            return ResponseEntity.status(302)
                    .header("Location", frontendUrl)
                    .build();
                    
        } catch (Exception e) {
            log.error("Google OAuth callback failed: {}", e.getMessage());
            
            // Redirect to frontend with error
            String frontendUrl = String.format(
                "%s/login?error=%s",
                System.getenv("FRONTEND_BASE_URL"),
                e.getMessage()
            );
            
            return ResponseEntity.status(302)
                    .header("Location", frontendUrl)
                    .build();
        }
    }

    private String extractClientIp(HttpServletRequest request) {
        String clientIp = request.getHeader("X-Forwarded-For");
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getHeader("X-Real-IP");
        }
        if (clientIp == null || clientIp.isEmpty()) {
            clientIp = request.getRemoteAddr();
        }
        // Handle multiple IPs in X-Forwarded-For (take the first one)
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
