package com.example.backend.services;

import com.example.backend.dto.response.GoogleAuthUrlResponse;
import com.example.backend.dto.response.GoogleTokenResponse;
import com.example.backend.dto.response.GoogleUserInfo;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.GoogleAccount;
import com.example.backend.entities.Role;
import com.example.backend.entities.RoleName;
import com.example.backend.entities.User;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.GoogleAccountRepository;
import com.example.backend.repositories.RoleRepository;
import com.example.backend.repositories.UserRepository;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.jwk.source.RemoteJWKSet;
import com.nimbusds.jose.proc.JWSKeySelector;
import com.nimbusds.jose.proc.JWSVerificationKeySelector;
import com.nimbusds.jose.proc.SecurityContext;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.proc.ConfigurableJWTProcessor;
import com.nimbusds.jwt.proc.DefaultJWTProcessor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URL;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleOAuthService {
    
    private final GoogleAccountRepository googleAccountRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate;
    private final RoleRepository roleRepository;
    
    @Value("${google.oauth.client-id}")
    private String googleClientId;
    
    @Value("${google.oauth.client-secret}")
    private String googleClientSecret;
    
    @Value("${google.oauth.redirect-uri}")
    private String googleRedirectUri;
    
    public GoogleAuthUrlResponse generateAuthorizationUrl() {
        // Generate random state token for CSRF protection
        String state = java.util.UUID.randomUUID().toString();
        
        // Build authorization URL
        String authorizationUrl = "https://accounts.google.com/o/oauth2/v2/auth"
                + "?client_id=" + googleClientId
                + "&redirect_uri=" + googleRedirectUri
                + "&response_type=code"
                + "&scope=openid%20email%20profile"
                + "&state=" + state;
        
        log.info("Generated Google OAuth authorization URL with state: {}", state);
        
        return new GoogleAuthUrlResponse(authorizationUrl, state);
    }
    

    public GoogleTokenResponse exchangeAuthorizationCode(String code, String state) {
        log.info("Exchanging authorization code for tokens");
        
        // Build token exchange request
        String tokenEndpoint = "https://oauth2.googleapis.com/token";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        
        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", googleClientId);
        params.add("client_secret", googleClientSecret);
        params.add("redirect_uri", googleRedirectUri);
        params.add("grant_type", "authorization_code");
        
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        
        // Implement retry logic with exponential backoff (max 2 retries)
        int maxRetries = 2;
        int retryCount = 0;
        long backoffMs = 1000; // Start with 1 second
        
        while (retryCount <= maxRetries) {
            try {
                GoogleTokenResponse response = restTemplate.postForObject(
                    tokenEndpoint, 
                    request, 
                    GoogleTokenResponse.class
                );
                
                log.info("Successfully exchanged authorization code for tokens");
                return response;
                
            } catch (HttpClientErrorException e) {
                log.error("Invalid authorization code: {}", e.getMessage());
                throw new AppException(ErrorCode.INVALID_AUTHORIZATION_CODE);
                
            } catch (RestClientException e) {
                retryCount++;
                if (retryCount > maxRetries) {
                    log.error("Google service unavailable after {} retries", maxRetries);
                    throw new AppException(ErrorCode.GOOGLE_SERVICE_UNAVAILABLE);
                }
                
                log.warn("Token exchange failed, retry {}/{} after {}ms", retryCount, maxRetries, backoffMs);
                try {
                    Thread.sleep(backoffMs);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                    throw new AppException(ErrorCode.GOOGLE_SERVICE_UNAVAILABLE);
                }
                
                backoffMs *= 2; // Exponential backoff
            }
        }
        
        throw new AppException(ErrorCode.GOOGLE_SERVICE_UNAVAILABLE);
    }
    

    public GoogleUserInfo extractUserInfo(String idToken) {
        try {
            log.info("Extracting and verifying user info from ID token");
            
            // Configure JWT processor with Google's public keys
            ConfigurableJWTProcessor<SecurityContext> jwtProcessor = new DefaultJWTProcessor<>();
            
            // Set up JWK source from Google's public keys endpoint
            @SuppressWarnings("deprecation")
            JWKSource<SecurityContext> keySource = new RemoteJWKSet<>(
                new URL("https://www.googleapis.com/oauth2/v3/certs")
            );
            
            // Configure the JWT processor to use RS256 algorithm
            JWSAlgorithm expectedJWSAlg = JWSAlgorithm.RS256;
            JWSKeySelector<SecurityContext> keySelector = new JWSVerificationKeySelector<>(
                expectedJWSAlg, 
                keySource
            );
            jwtProcessor.setJWSKeySelector(keySelector);
            
            // Process and verify the ID token
            JWTClaimsSet claimsSet = jwtProcessor.process(idToken, null);
            
            // Verify issuer claim
            String issuer = claimsSet.getIssuer();
            if (!issuer.equals("https://accounts.google.com") && !issuer.equals("accounts.google.com")) {
                log.error("Invalid issuer: {}", issuer);
                throw new AppException(ErrorCode.INVALID_ID_TOKEN);
            }
            
            // Verify audience claim
            String audience = claimsSet.getAudience().get(0);
            if (!audience.equals(googleClientId)) {
                log.error("Invalid audience: {}", audience);
                throw new AppException(ErrorCode.INVALID_ID_TOKEN);
            }
            
            // Extract claims
            String sub = claimsSet.getSubject();
            String email = claimsSet.getStringClaim("email");
            String name = claimsSet.getStringClaim("name");
            Boolean emailVerified = claimsSet.getBooleanClaim("email_verified");
            String picture = claimsSet.getStringClaim("picture");
            
            log.info("Successfully extracted user info for email: {}", email);
            
            return new GoogleUserInfo(sub, email, name, emailVerified, picture);
            
        } catch (Exception e) {
            log.error("Failed to extract user info from ID token: {}", e.getMessage());
            throw new AppException(ErrorCode.INVALID_ID_TOKEN);
        }
    }
    

    public User authenticateWithGoogle(String code, String state) {
        log.info("Authenticating user with Google OAuth");
        
        // Exchange authorization code for tokens
        GoogleTokenResponse tokenResponse = exchangeAuthorizationCode(code, state);
        
        // Extract user info from ID token
        GoogleUserInfo userInfo = extractUserInfo(tokenResponse.getIdToken());
        
        // Check if email is verified
        if (userInfo.getEmailVerified() == null || !userInfo.getEmailVerified()) {
            log.error("Email not verified for: {}", userInfo.getEmail());
            throw new AppException(ErrorCode.EMAIL_NOT_VERIFIED);
        }
        
        // Find or create user
        User user = findOrCreateUser(userInfo);
        
        log.info("Successfully authenticated user: {}", user.getEmail());
        return user;
    }

    @Transactional
    private User findOrCreateUser(GoogleUserInfo googleUserInfo) {
        log.info("Finding or creating user for Google sub: {}", googleUserInfo.getSub());
        
        // Query GoogleAccountRepository by google_sub
        Optional<GoogleAccount> existingGoogleAccount = googleAccountRepository.findByGoogleSub(
            googleUserInfo.getSub()
        );
        
        if (existingGoogleAccount.isPresent()) {
            // Google account exists, return associated User
            log.info("Found existing Google account for sub: {}", googleUserInfo.getSub());
            return existingGoogleAccount.get().getUser();
        }
        
        // Google account doesn't exist, check if email exists
        Optional<User> existingUser = userRepository.findByEmail(googleUserInfo.getEmail());
        
        User user;
        if (existingUser.isPresent()) {
            // Email exists, link GoogleAccount with existing User
            log.info("Found existing user with email: {}, linking Google account", googleUserInfo.getEmail());
            user = existingUser.get();
        } else {
            // Email doesn't exist, create new User with role RESTAURANT_OWNER
            log.info("Creating new user for email: {}", googleUserInfo.getEmail());
            
            Role restaurantOwnerRole = roleRepository.findByName(RoleName.RESTAURANT_OWNER)
                .orElseThrow(() -> new AppException(ErrorCode.UNEXPECTED_EXCEPTION));
            
            user = new User();
            user.setEmail(googleUserInfo.getEmail());
            user.setUsername(googleUserInfo.getName());
            user.setPassword(""); // No password for Google OAuth users
            user.setRole(restaurantOwnerRole);
            user.setStatus(EntityStatus.ACTIVE);
            
            user = userRepository.save(user);
            log.info("Created new user with ID: {}", user.getUserId());
        }
        
        // Create GoogleAccount entity linking google_sub and user_id
        GoogleAccount googleAccount = new GoogleAccount(
            googleUserInfo.getSub(),
            googleUserInfo.getSub(), // Using sub as google_id as well
            user
        );
        googleAccountRepository.save(googleAccount);
        log.info("Created Google account mapping for user: {}", user.getEmail());
        
        return user;
    }
}
