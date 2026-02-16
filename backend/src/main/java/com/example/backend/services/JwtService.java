package com.example.backend.services;

import com.example.backend.config.JwtProperties;
import com.example.backend.entities.RefreshToken;
import com.example.backend.entities.User;
import com.example.backend.exception.ErrorCode;
import com.example.backend.exception.JwtAuthenticationException;
import com.example.backend.repositories.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class JwtService {
    
    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final JwtProperties jwtProperties;
    private final RefreshTokenRepository refreshTokenRepository;
    
    /**
     * Tạo access token từ user
     * @param user User entity
     * @return JWT access token string
     */
    public String generateAccessToken(User user) {
        var now = java.time.Instant.now();
        var expiry = now.plusSeconds(jwtProperties.getAccessTokenExpiration());
        
        var claims = org.springframework.security.oauth2.jwt.JwtClaimsSet.builder()
                .subject(user.getUserId().toString())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().getName().name())
                .issuedAt(now)
                .expiresAt(expiry)
                .id(UUID.randomUUID().toString())
                .build();
        
        return jwtEncoder.encode(
                org.springframework.security.oauth2.jwt.JwtEncoderParameters.from(claims)
        ).getTokenValue();
    }
    
    /**
     * Tạo refresh token và lưu vào database
     * @param user User entity
     * @param clientIp Client IP address
     * @param userAgent User agent string
     * @return Refresh token string
     */
    @Transactional
    public String generateRefreshToken(User user, String clientIp, String userAgent) {
        var tokenId = UUID.randomUUID().toString();
        var tokenString = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        
        // Hash token bằng SHA-256
        String tokenHash;
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            var hashBytes = digest.digest(tokenString.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            tokenHash = bytesToHex(hashBytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
        
        var now = java.time.Instant.now();
        var expiry = now.plusSeconds(jwtProperties.getRefreshTokenExpiration());
        
        // Tạo RefreshToken entity
        var refreshToken = new RefreshToken();
        refreshToken.setId(tokenId);
        refreshToken.setTokenHash(tokenHash);
        refreshToken.setUser(user);
        refreshToken.setIssuedAt(now);
        refreshToken.setExpiresAt(expiry);
        refreshToken.setClientIp(clientIp);
        refreshToken.setUserAgent(userAgent);
        
        // Lưu vào database
        refreshTokenRepository.save(refreshToken);
        
        // Return token string (không phải hash)
        return tokenId + ":" + tokenString;
    }
    
    private String bytesToHex(byte[] bytes) {
        var hexString = new StringBuilder(2 * bytes.length);
        for (byte b : bytes) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
    
    /**
     * Xác thực access token và trả về claims
     * @param token JWT token string
     * @return Jwt object với claims
     * @throws JwtAuthenticationException nếu token không hợp lệ
     */
    public Jwt validateAccessToken(String token) {
        try {
            var jwt = jwtDecoder.decode(token);
            
            // Check expiration
            var now = java.time.Instant.now();
            if (jwt.getExpiresAt() != null && jwt.getExpiresAt().isBefore(now)) {
                throw new JwtAuthenticationException(ErrorCode.JWT_EXPIRED);
            }
            
            return jwt;
        } catch (org.springframework.security.oauth2.jwt.JwtException e) {
            // Handle different JWT exceptions
            if (e.getMessage().contains("expired")) {
                throw new JwtAuthenticationException(ErrorCode.JWT_EXPIRED, e);
            } else if (e.getMessage().contains("signature")) {
                throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_SIGNATURE, e);
            } else {
                throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT, e);
            }
        }
    }
    
    /**
     * Xác thực refresh token và trả về user
     * @param refreshToken Refresh token string
     * @return User entity
     * @throws JwtAuthenticationException nếu token không hợp lệ
     */
    @Transactional(readOnly = true)
    public User validateRefreshToken(String refreshToken) {
        // Extract token ID và token string từ format "tokenId:tokenString"
        String[] parts = refreshToken.split(":", 2);
        if (parts.length != 2) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT);
        }
        
        String tokenId = parts[0];
        String tokenString = parts[1];
        
        // Query RefreshToken entity từ database
        RefreshToken storedToken = refreshTokenRepository.findById(tokenId)
                .orElseThrow(() -> new JwtAuthenticationException(ErrorCode.REFRESH_TOKEN_NOT_FOUND));
        
        // Check expiration
        var now = java.time.Instant.now();
        if (storedToken.getExpiresAt().isBefore(now)) {
            throw new JwtAuthenticationException(ErrorCode.REFRESH_TOKEN_EXPIRED);
        }
        
        // Verify token hash matches
        String tokenHash;
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            var hashBytes = digest.digest(tokenString.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            tokenHash = bytesToHex(hashBytes);
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not found", e);
        }
        
        if (!tokenHash.equals(storedToken.getTokenHash())) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_SIGNATURE);
        }
        
        // Return User entity
        return storedToken.getUser();
    }
    
    /**
     * Lấy user ID từ JWT
     * @param jwt Jwt object
     * @return User ID
     */
    public UUID getUserIdFromToken(Jwt jwt) {
        String subject = jwt.getSubject();
        return UUID.fromString(subject);
    }
    
    /**
     * Xóa refresh token (logout)
     * @param refreshToken Refresh token string
     */
    @Transactional
    public void deleteRefreshToken(String refreshToken) {
        // Extract token ID từ format "tokenId:tokenString"
        String[] parts = refreshToken.split(":", 2);
        if (parts.length != 2) {
            throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT);
        }
        
        String tokenId = parts[0];
        
        // Delete từ database
        refreshTokenRepository.deleteById(tokenId);
    }
}
