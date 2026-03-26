package com.example.backend.service;

import com.example.backend.dto.BranchDTO;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BranchMapper;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.repositories.StaffAccountRepository;
import com.example.backend.services.BranchService;
import com.example.backend.services.FeatureLimitCheckerService;
import com.example.backend.services.OwnershipValidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for BranchService using Mockito
 * Note: SecurityContext-dependent methods are not tested here as they require Spring Security setup
 */
@ExtendWith(MockitoExtension.class)
class BranchServiceTest {

    @Mock
    private BranchRepository branchRepository;

    @Mock
    private BranchMapper branchMapper;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private StaffAccountRepository staffAccountRepository;

    @Mock
    private FeatureLimitCheckerService featureLimitCheckerService;

    @Mock
    private OwnershipValidationService ownershipValidationService;

    @InjectMocks
    private BranchService branchService;

    private UUID branchId;
    private UUID restaurantId;
    private Branch testBranch;
    private BranchDTO testBranchDTO;
    private Restaurant testRestaurant;

    @BeforeEach
    void setUp() {
        branchId = UUID.randomUUID();
        restaurantId = UUID.randomUUID();

        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(restaurantId);
        testRestaurant.setName("Test Restaurant");

        testBranch = new Branch();
        testBranch.setBranchId(branchId);
        testBranch.setAddress("123 Test St");
        testBranch.setBranchPhone("0123456789");
        testBranch.setMail("branch@example.com");
        testBranch.setOpeningTime(LocalTime.of(9, 0));
        testBranch.setClosingTime(LocalTime.of(22, 0));
        testBranch.setActive(true);
        testBranch.setRestaurant(testRestaurant);

        testBranchDTO = new BranchDTO();
        testBranchDTO.setBranchId(branchId);
        testBranchDTO.setAddress("123 Test St");
        testBranchDTO.setBranchPhone("0123456789");
        testBranchDTO.setMail("branch@example.com");
        testBranchDTO.setOpeningTime(LocalTime.of(9, 0));
        testBranchDTO.setClosingTime(LocalTime.of(22, 0));
        testBranchDTO.setRestaurantId(restaurantId);
        testBranchDTO.setActive(true);
    }

    @Test
    @DisplayName("Should get all branches")
    void testGetAll() {
        // Given
        List<Branch> branches = Arrays.asList(testBranch);
        when(branchRepository.findAll()).thenReturn(branches);
        when(branchMapper.toDto(testBranch)).thenReturn(testBranchDTO);
        when(staffAccountRepository.countByBranch(testBranch)).thenReturn(5L);

        // When
        List<BranchDTO> result = branchService.getAll();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getAddress()).isEqualTo("123 Test St");
        verify(branchRepository).findAll();
    }

    @Test
    @DisplayName("Should get branch by ID")
    void testGetById() {
        // Given
        when(branchRepository.findById(branchId)).thenReturn(Optional.of(testBranch));
        when(branchMapper.toDto(testBranch)).thenReturn(testBranchDTO);
        when(staffAccountRepository.countByBranch(testBranch)).thenReturn(3L);

        // When
        BranchDTO result = branchService.getById(branchId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getAddress()).isEqualTo("123 Test St");
        verify(branchRepository).findById(branchId);
    }

    @Test
    @DisplayName("Should throw exception when branch not found")
    void testGetByIdNotFound() {
        // Given
        when(branchRepository.findById(branchId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> branchService.getById(branchId))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.BRANCH_NOTEXISTED);
    }

    @Test
    @DisplayName("Should create branch successfully")
    void testCreate() {
        // Given
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(testRestaurant));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        doNothing().when(featureLimitCheckerService).checkLimit(eq(restaurantId), any(), any());
        when(branchMapper.toEntity(testBranchDTO)).thenReturn(testBranch);
        when(branchRepository.save(any(Branch.class))).thenReturn(testBranch);
        when(branchMapper.toDto(testBranch)).thenReturn(testBranchDTO);
        when(staffAccountRepository.countByBranch(testBranch)).thenReturn(0L);

        // When
        BranchDTO result = branchService.create(testBranchDTO);

        // Then
        assertThat(result).isNotNull();
        verify(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        verify(featureLimitCheckerService).checkLimit(eq(restaurantId), any(), any());
        verify(branchRepository).save(any(Branch.class));
    }

    @Test
    @DisplayName("Should throw exception when creating branch without opening/closing time")
    void testCreateWithoutTime() {
        // Given
        testBranchDTO.setOpeningTime(null);
        testBranchDTO.setClosingTime(null);

        // When & Then
        assertThatThrownBy(() -> branchService.create(testBranchDTO))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST);
    }

    @Test
    @DisplayName("Should throw exception when restaurant not found during create")
    void testCreateRestaurantNotFound() {
        // Given
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> branchService.create(testBranchDTO))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESTAURANT_NOTEXISTED);
    }

    @Test
    @DisplayName("Should update branch successfully")
    void testUpdate() {
        // Given
        BranchDTO updateDTO = new BranchDTO();
        updateDTO.setAddress("456 Updated St");
        updateDTO.setOpeningTime(LocalTime.of(8, 0));
        updateDTO.setClosingTime(LocalTime.of(23, 0));

        when(branchRepository.findById(branchId)).thenReturn(Optional.of(testBranch));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        doNothing().when(branchMapper).updateEntityFromDto(updateDTO, testBranch);
        when(branchRepository.save(any(Branch.class))).thenReturn(testBranch);
        when(branchMapper.toDto(testBranch)).thenReturn(testBranchDTO);
        when(staffAccountRepository.countByBranch(testBranch)).thenReturn(3L);

        // When
        BranchDTO result = branchService.update(branchId, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        verify(branchRepository).save(any(Branch.class));
    }

    @Test
    @DisplayName("Should throw exception when updating with invalid time")
    void testUpdateWithInvalidTime() {
        // Given
        BranchDTO updateDTO = new BranchDTO();
        updateDTO.setOpeningTime(LocalTime.of(8, 0));
        updateDTO.setClosingTime(null); // Missing closing time

        when(branchRepository.findById(branchId)).thenReturn(Optional.of(testBranch));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);

        // When & Then
        assertThatThrownBy(() -> branchService.update(branchId, updateDTO))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.INVALID_REQUEST);
    }

    @Test
    @DisplayName("Should delete branch successfully")
    void testDelete() {
        // Given
        when(branchRepository.findById(branchId)).thenReturn(Optional.of(testBranch));
        when(branchRepository.save(any(Branch.class))).thenReturn(testBranch);

        // When
        branchService.delete(branchId);

        // Then
        verify(branchRepository).save(any(Branch.class));
    }

    @Test
    @DisplayName("Should get branches by restaurant")
    void testGetByRestaurant() {
        // Given
        List<Branch> branches = Arrays.asList(testBranch);
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        when(branchRepository.findByRestaurant_RestaurantId(restaurantId)).thenReturn(branches);
        when(branchMapper.toDto(testBranch)).thenReturn(testBranchDTO);
        when(staffAccountRepository.countByBranch(testBranch)).thenReturn(2L);

        // When
        List<BranchDTO> result = branchService.getByRestaurant(restaurantId);

        // Then
        assertThat(result).hasSize(1);
        verify(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        verify(branchRepository).findByRestaurant_RestaurantId(restaurantId);
    }

    @Test
    @DisplayName("Should get active branches by restaurant")
    void testGetActiveByRestaurant() {
        // Given
        List<Branch> branches = Arrays.asList(testBranch);
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        when(branchRepository.findByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId)).thenReturn(branches);
        when(branchMapper.toDto(testBranch)).thenReturn(testBranchDTO);
        when(staffAccountRepository.countByBranch(testBranch)).thenReturn(2L);

        // When
        List<BranchDTO> result = branchService.getActiveByRestaurant(restaurantId);

        // Then
        assertThat(result).hasSize(1);
        verify(branchRepository).findByRestaurant_RestaurantIdAndIsActiveTrue(restaurantId);
    }

    @Test
    @DisplayName("Should get restaurant ID by branch ID")
    void testGetRestaurantIdByBranchId() {
        // Given
        when(branchRepository.findRestaurantIdByBranchId(branchId)).thenReturn(Optional.of(restaurantId));

        // When
        UUID result = branchService.getRestaurantIdByBranchId(branchId);

        // Then
        assertThat(result).isEqualTo(restaurantId);
        verify(branchRepository).findRestaurantIdByBranchId(branchId);
    }

    @Test
    @DisplayName("Should get restaurant slug by branch ID")
    void testGetRestaurantSlugByBranchId() {
        // Given
        testRestaurant.setPublicUrl("test-restaurant");
        when(branchRepository.findById(branchId)).thenReturn(Optional.of(testBranch));

        // When
        String result = branchService.getRestaurantSlugByBranchId(branchId);

        // Then
        assertThat(result).isEqualTo("test-restaurant");
        verify(branchRepository).findById(branchId);
    }

    @Test
    @DisplayName("Should check if can create branch")
    void testCanCreateBranch() {
        // Given
        when(featureLimitCheckerService.isUnderLimit(eq(restaurantId), any(), any())).thenReturn(true);

        // When
        boolean result = branchService.canCreateBranch(restaurantId);

        // Then
        assertThat(result).isTrue();
        verify(featureLimitCheckerService).isUnderLimit(eq(restaurantId), any(), any());
    }
}
