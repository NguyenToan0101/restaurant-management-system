package com.example.backend.services;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.UserDTO;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AuthenticationMapper;
import com.example.backend.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationMapper authenticationMapper;
    
    @Transactional
    public AuthenticationResponse login(LoginRequest request, String clientIp, String userAgent) {
        log.info("Login attempt for email: {}", request.getEmail());
        
        // Query user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_CREDENTIALS));
        
        // Verify password với PasswordEncoder
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Invalid password for email: {}", request.getEmail());
            throw new AppException(ErrorCode.INVALID_CREDENTIALS);
        }
        
        // Check user status (ACTIVE)
        if (user.getStatus() != EntityStatus.ACTIVE) {
            log.warn("Inactive user attempted login: {}", request.getEmail());
            throw new AppException(ErrorCode.USER_INACTIVE);
        }
        
        // Generate access token và refresh token
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user, clientIp, userAgent);
        
        // Map User sang UserDTO
        UserDTO userDTO = authenticationMapper.toUserDTO(user);
        
        log.info("Login successful for email: {}", request.getEmail());
        
        // Return AuthenticationResponse
        return new AuthenticationResponse(accessToken, refreshToken, userDTO);
    }
    
    @Transactional
    public AuthenticationResponse refreshToken(RefreshRequest request, String clientIp, String userAgent) {
        log.info("Token refresh attempt");
        
        // Validate refresh token
        User user = jwtService.validateRefreshToken(request.getRefreshToken());
        
        // Generate new access token
        String accessToken = jwtService.generateAccessToken(user);
        
        // Generate new refresh token
        String refreshToken = jwtService.generateRefreshToken(user, clientIp, userAgent);
        
        // Map User sang UserDTO
        UserDTO userDTO = authenticationMapper.toUserDTO(user);
        
        log.info("Token refresh successful for user: {}", user.getEmail());
        
        // Return AuthenticationResponse
        return new AuthenticationResponse(accessToken, refreshToken, userDTO);
    }

    @Transactional
    public void logout(String refreshToken) {
        log.info("Logout attempt");
        
        // Call JwtService.deleteRefreshToken
        jwtService.deleteRefreshToken(refreshToken);
        
        log.info("Logout successful");
    }
}
