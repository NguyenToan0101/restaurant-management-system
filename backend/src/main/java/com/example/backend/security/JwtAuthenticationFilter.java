package com.example.backend.security;

import com.example.backend.entities.User;
import com.example.backend.exception.ErrorCode;
import com.example.backend.exception.JwtAuthenticationException;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.JwtService;
import com.nimbusds.jwt.SignedJWT;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    
    private final JwtService jwtService;
    private final UserRepository userRepository;
    
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        // Skip nếu là public endpoint
        String requestPath = request.getRequestURI();
        if (isPublicEndpoint(requestPath)) {
            filterChain.doFilter(request, response);
            return;
        }
        
        try {
            // Extract token từ Authorization header
            String token = extractTokenFromRequest(request);
            
            if (token == null) {
                throw new JwtAuthenticationException(ErrorCode.JWT_MISSING);
            }
            
            // Validate token với JwtService
            SignedJWT jwt = jwtService.validateAccessToken(token);
            
            // Get user ID từ token
            UUID userId = jwtService.getUserIdFromToken(jwt);
            
            // Load user từ database
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new JwtAuthenticationException(ErrorCode.USER_NOT_FOUND));
            
            // Tạo Authentication object
            try {
                String role = jwt.getJWTClaimsSet().getClaim("role").toString();
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + role);
                
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        user,
                        null,
                        Collections.singletonList(authority)
                );
                
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                
                // Set vào SecurityContext
                SecurityContextHolder.getContext().setAuthentication(authentication);
                
                log.debug("Successfully authenticated user: {}", user.getEmail());
            } catch (java.text.ParseException e) {
                log.error("Failed to parse JWT claims", e);
                throw new JwtAuthenticationException(ErrorCode.INVALID_JWT_FORMAT);
            }
            
        } catch (JwtAuthenticationException e) {
            log.error("JWT authentication failed: {}", e.getMessage());
            
            // Set response status to 401 for JWT errors
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding("UTF-8");
            
            String jsonResponse = String.format(
                "{\"code\": %d, \"message\": \"%s\"}",
                e.getErrorCode().getCode(),
                e.getErrorCode().getMessage()
            );
            response.getWriter().write(jsonResponse);
            return;
        }
        
        // Continue filter chain
        filterChain.doFilter(request, response);
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
    
    private boolean isPublicEndpoint(String requestPath) {
        return requestPath.equals("/api/auth/login") || 
               requestPath.equals("/api/auth/refresh") ||
               requestPath.equals("/api/auth/logout") ||
               requestPath.startsWith("/api/auth/google/");
    }
}
