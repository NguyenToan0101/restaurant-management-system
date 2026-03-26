package com.example.backend.service;

import com.example.backend.dto.request.LoginRequest;
import com.example.backend.dto.request.RefreshRequest;
import com.example.backend.dto.request.StaffLoginRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.StaffAuthResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AuthenticationMapper;
import com.example.backend.repositories.StaffAccountRepository;
import com.example.backend.repositories.UserRepository;
import com.example.backend.services.AuthenticationService;
import com.example.backend.services.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.*;

/**
 * Unit tests for AuthenticationService using Mockito
 * Tests login, refresh token, and logout functionality (excluding Google OAuth)
 */
@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StaffAccountRepository staffAccountRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationMapper authenticationMapper;

    @InjectMocks
    private AuthenticationService authenticationService;

    private User testUser;
    private StaffAccount testStaff;
    private UserResponse testUserResponse;
    private String clientIp = "127.0.0.1";
    private String userAgent = "Mozilla/5.0";

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = new User();
        testUser.setUserId(UUID.randomUUID());
        testUser.setEmail("test@example.com");
        testUser.setPassword("$2a$10$encodedPassword");
        testUser.setStatus(EntityStatus.ACTIVE);

        Role userRole = new Role();
        userRole.setName(RoleName.RESTAURANT_OWNER);
        testUser.setRole(userRole);

        testUserResponse = new UserResponse();
        testUserResponse.setUserId(testUser.getUserId());
        testUserResponse.setEmail(testUser.getEmail());

        // Setup test staff
        Restaurant restaurant = new Restaurant();
        restaurant.setRestaurantId(UUID.randomUUID());

        Branch branch = new Branch();
        branch.setBranchId(UUID.randomUUID());
        branch.setRestaurant(restaurant);

        Role staffRole = new Role();
        staffRole.setName(RoleName.WAITER);

        testStaff = new StaffAccount();
        testStaff.setStaffAccountId(UUID.randomUUID());
        testStaff.setUsername("waiter01");
        testStaff.setPassword("$2a$10$encodedPassword");
        testStaff.setStatus(EntityStatus.ACTIVE);
        testStaff.setBranch(branch);
        testStaff.setRole(staffRole);
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testLoginSuccess() {
        // Given
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getPassword(), testUser.getPassword())).thenReturn(true);
        when(jwtService.generateAccessToken(testUser)).thenReturn("access-token");
        when(jwtService.generateRefreshToken(testUser, clientIp, userAgent)).thenReturn("refresh-token");
        when(authenticationMapper.toUserResponse(testUser)).thenReturn(testUserResponse);

        // When
        AuthenticationResponse response = authenticationService.login(request, clientIp, userAgent);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("access-token");
        assertThat(response.getRefreshToken()).isEqualTo("refresh-token");
        assertThat(response.getUser()).isEqualTo(testUserResponse);
        
        verify(userRepository).findByEmail(request.getEmail());
        verify(passwordEncoder).matches(request.getPassword(), testUser.getPassword());
        verify(jwtService).generateAccessToken(testUser);
        verify(jwtService).generateRefreshToken(testUser, clientIp, userAgent);
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void testLoginUserNotFound() {
        // Given
        LoginRequest request = new LoginRequest("notfound@example.com", "password123");
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.login(request, clientIp, userAgent))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_CREDENTIALS);
    }

    @Test
    @DisplayName("Should throw exception when password is incorrect")
    void testLoginInvalidPassword() {
        // Given
        LoginRequest request = new LoginRequest("test@example.com", "wrongpassword");
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getPassword(), testUser.getPassword())).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authenticationService.login(request, clientIp, userAgent))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_CREDENTIALS);
    }

    @Test
    @DisplayName("Should throw exception when user is inactive")
    void testLoginInactiveUser() {
        // Given
        testUser.setStatus(EntityStatus.INACTIVE);
        LoginRequest request = new LoginRequest("test@example.com", "password123");
        
        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(request.getPassword(), testUser.getPassword())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authenticationService.login(request, clientIp, userAgent))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_INACTIVE);
    }

    @Test
    @DisplayName("Should staff login successfully with valid credentials")
    void testStaffLoginSuccess() {
        // Given
        UUID restaurantId = testStaff.getBranch().getRestaurant().getRestaurantId();
        StaffLoginRequest request = new StaffLoginRequest(restaurantId, "waiter01", "password123");
        
        when(staffAccountRepository.findByUsernameAndBranch_Restaurant_RestaurantId(
            request.getUsername(), request.getRestaurantId())).thenReturn(Optional.of(testStaff));
        when(passwordEncoder.matches(request.getPassword(), testStaff.getPassword())).thenReturn(true);
        when(jwtService.generateAccessToken(testStaff)).thenReturn("staff-access-token");
        when(jwtService.generateRefreshToken(testStaff, clientIp, userAgent)).thenReturn("staff-refresh-token");

        // When
        StaffAuthResponse response = authenticationService.staffLogin(request, clientIp, userAgent);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("staff-access-token");
        assertThat(response.getRefreshToken()).isEqualTo("staff-refresh-token");
        assertThat(response.getStaffInfo().getUsername()).isEqualTo("waiter01");
        assertThat(response.getStaffInfo().getRole()).isEqualTo("WAITER");
    }

    @Test
    @DisplayName("Should throw exception when staff not found")
    void testStaffLoginNotFound() {
        // Given
        UUID restaurantId = UUID.randomUUID();
        StaffLoginRequest request = new StaffLoginRequest(restaurantId, "notfound", "password123");
        
        when(staffAccountRepository.findByUsernameAndBranch_Restaurant_RestaurantId(
            request.getUsername(), request.getRestaurantId())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.staffLogin(request, clientIp, userAgent))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_CREDENTIALS);
    }

    @Test
    @DisplayName("Should throw exception when staff password is incorrect")
    void testStaffLoginInvalidPassword() {
        // Given
        UUID restaurantId = testStaff.getBranch().getRestaurant().getRestaurantId();
        StaffLoginRequest request = new StaffLoginRequest(restaurantId, "waiter01", "wrongpassword");
        
        when(staffAccountRepository.findByUsernameAndBranch_Restaurant_RestaurantId(
            request.getUsername(), request.getRestaurantId())).thenReturn(Optional.of(testStaff));
        when(passwordEncoder.matches(request.getPassword(), testStaff.getPassword())).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> authenticationService.staffLogin(request, clientIp, userAgent))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_CREDENTIALS);
    }

    @Test
    @DisplayName("Should throw exception when staff is inactive")
    void testStaffLoginInactive() {
        // Given
        testStaff.setStatus(EntityStatus.INACTIVE);
        UUID restaurantId = testStaff.getBranch().getRestaurant().getRestaurantId();
        StaffLoginRequest request = new StaffLoginRequest(restaurantId, "waiter01", "password123");
        
        when(staffAccountRepository.findByUsernameAndBranch_Restaurant_RestaurantId(
            request.getUsername(), request.getRestaurantId())).thenReturn(Optional.of(testStaff));
        when(passwordEncoder.matches(request.getPassword(), testStaff.getPassword())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authenticationService.staffLogin(request, clientIp, userAgent))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.USER_INACTIVE);
    }

    @Test
    @DisplayName("Should refresh token successfully")
    void testRefreshTokenSuccess() {
        // Given
        RefreshRequest request = new RefreshRequest("old-refresh-token");
        
        when(jwtService.validateRefreshToken(request.getRefreshToken())).thenReturn(testUser);
        when(jwtService.generateAccessToken(testUser)).thenReturn("new-access-token");
        when(jwtService.generateRefreshToken(testUser, clientIp, userAgent)).thenReturn("new-refresh-token");
        when(authenticationMapper.toUserResponse(testUser)).thenReturn(testUserResponse);

        // When
        AuthenticationResponse response = authenticationService.refreshToken(request, clientIp, userAgent);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new-access-token");
        assertThat(response.getRefreshToken()).isEqualTo("new-refresh-token");
        assertThat(response.getUser()).isEqualTo(testUserResponse);
        
        verify(jwtService).validateRefreshToken(request.getRefreshToken());
        verify(jwtService).generateAccessToken(testUser);
        verify(jwtService).generateRefreshToken(testUser, clientIp, userAgent);
    }

    @Test
    @DisplayName("Should refresh staff token successfully")
    void testStaffRefreshTokenSuccess() {
        // Given
        RefreshRequest request = new RefreshRequest("old-staff-refresh-token");
        
        when(jwtService.validateStaffRefreshToken(request.getRefreshToken())).thenReturn(testStaff);
        when(jwtService.generateAccessToken(testStaff)).thenReturn("new-staff-access-token");
        when(jwtService.generateRefreshToken(testStaff, clientIp, userAgent)).thenReturn("new-staff-refresh-token");

        // When
        StaffAuthResponse response = authenticationService.staffRefreshToken(request, clientIp, userAgent);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("new-staff-access-token");
        assertThat(response.getRefreshToken()).isEqualTo("new-staff-refresh-token");
        assertThat(response.getStaffInfo().getUsername()).isEqualTo("waiter01");
        
        verify(jwtService).validateStaffRefreshToken(request.getRefreshToken());
        verify(jwtService).generateAccessToken(testStaff);
        verify(jwtService).generateRefreshToken(testStaff, clientIp, userAgent);
    }

    @Test
    @DisplayName("Should logout successfully")
    void testLogoutSuccess() {
        // Given
        String refreshToken = "refresh-token-to-delete";
        doNothing().when(jwtService).deleteRefreshToken(refreshToken);

        // When
        authenticationService.logout(refreshToken);

        // Then
        verify(jwtService).deleteRefreshToken(refreshToken);
    }
}
