package com.example.backend.service;

import com.example.backend.dto.PackageFeatureDTO;
import com.example.backend.entities.Package;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.PackageRepository;
import com.example.backend.repositories.SubscriptionRepository;
import com.example.backend.services.PackageFeatureService;
import com.example.backend.services.PackageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for PackageService using Mockito
 */
@ExtendWith(MockitoExtension.class)
class PackageServiceTest {

    @Mock
    private PackageRepository packageRepository;

    @Mock
    private PackageFeatureService packageFeatureService;

    @Mock
    private SubscriptionRepository subscriptionRepository;

    @InjectMocks
    private PackageService packageService;

    private UUID packageId;
    private Package testPackage;
    private PackageFeatureDTO testPackageDTO;

    @BeforeEach
    void setUp() {
        packageId = UUID.randomUUID();

        testPackage = new Package();
        testPackage.setPackageId(packageId);
        testPackage.setName("Basic Plan");
        testPackage.setDescription("Basic subscription plan");
        testPackage.setPrice(100000);
        testPackage.setAvailable(true);
        testPackage.setBillingPeriod(1);

        testPackageDTO = new PackageFeatureDTO();
        testPackageDTO.setPackageId(packageId);
        testPackageDTO.setName("Basic Plan");
        testPackageDTO.setDescription("Basic subscription plan");
        testPackageDTO.setPrice(100000);
        testPackageDTO.setAvailable(true);
        testPackageDTO.setBillingPeriod(1);
        testPackageDTO.setFeatures(Collections.emptyList());
    }

    @Test
    @DisplayName("Should create package with features successfully")
    void testCreatePackageWithFeatures() {
        // Given
        when(packageRepository.existsByName(testPackageDTO.getName())).thenReturn(false);
        when(packageRepository.save(any(Package.class))).thenReturn(testPackage);
        when(packageFeatureService.getPackageWithFeatures(packageId)).thenReturn(testPackageDTO);

        // When
        PackageFeatureDTO result = packageService.createPackageWithFeatures(testPackageDTO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Basic Plan");
        verify(packageRepository).existsByName(testPackageDTO.getName());
        verify(packageRepository).save(any(Package.class));
        verify(packageFeatureService).getPackageWithFeatures(packageId);
    }

    @Test
    @DisplayName("Should throw exception when package name already exists")
    void testCreatePackageWithExistingName() {
        // Given
        when(packageRepository.existsByName(testPackageDTO.getName())).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> packageService.createPackageWithFeatures(testPackageDTO))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PACKAGE_NAME_EXISTED);
        
        verify(packageRepository).existsByName(testPackageDTO.getName());
        verify(packageRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should update package with features successfully")
    void testUpdatePackageWithFeatures() {
        // Given
        testPackageDTO.setName("Updated Plan");
        testPackageDTO.setPrice(200000);

        when(packageRepository.findById(packageId)).thenReturn(Optional.of(testPackage));
        when(packageRepository.save(any(Package.class))).thenReturn(testPackage);
        when(packageFeatureService.getPackageWithFeatures(packageId)).thenReturn(testPackageDTO);

        // When
        PackageFeatureDTO result = packageService.updatePackageWithFeatures(packageId, testPackageDTO);

        // Then
        assertThat(result).isNotNull();
        verify(packageRepository).findById(packageId);
        verify(packageRepository).save(any(Package.class));
        verify(packageFeatureService).getPackageWithFeatures(packageId);
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent package")
    void testUpdateNonExistentPackage() {
        // Given
        when(packageRepository.findById(packageId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> packageService.updatePackageWithFeatures(packageId, testPackageDTO))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PACKAGE_NOTEXISTED);
    }

    @Test
    @DisplayName("Should deactivate package successfully")
    void testDeactivatePackage() {
        // Given
        when(packageRepository.findById(packageId)).thenReturn(Optional.of(testPackage));
        when(subscriptionRepository.existsActiveSubscriptionsByPackageId(packageId)).thenReturn(false);
        when(packageRepository.save(any(Package.class))).thenReturn(testPackage);

        // When
        packageService.deactivatePackage(packageId);

        // Then
        verify(packageRepository).findById(packageId);
        verify(subscriptionRepository).existsActiveSubscriptionsByPackageId(packageId);
        verify(packageRepository).save(any(Package.class));
    }

    @Test
    @DisplayName("Should throw exception when deactivating package with active subscriptions")
    void testDeactivatePackageWithActiveSubscriptions() {
        // Given
        when(packageRepository.findById(packageId)).thenReturn(Optional.of(testPackage));
        when(subscriptionRepository.existsActiveSubscriptionsByPackageId(packageId)).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> packageService.deactivatePackage(packageId))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PACKAGE_HAS_ACTIVE_SUBSCRIPTIONS);
        
        verify(subscriptionRepository).existsActiveSubscriptionsByPackageId(packageId);
        verify(packageRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when deactivating non-existent package")
    void testDeactivateNonExistentPackage() {
        // Given
        when(packageRepository.findById(packageId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> packageService.deactivatePackage(packageId))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PACKAGE_NOTEXISTED);
    }

    @Test
    @DisplayName("Should activate package successfully")
    void testActivatePackage() {
        // Given
        testPackage.setAvailable(false);
        when(packageRepository.findById(packageId)).thenReturn(Optional.of(testPackage));
        when(packageRepository.save(any(Package.class))).thenReturn(testPackage);

        // When
        packageService.activatePackage(packageId);

        // Then
        verify(packageRepository).findById(packageId);
        verify(packageRepository).save(any(Package.class));
    }

    @Test
    @DisplayName("Should throw exception when activating non-existent package")
    void testActivateNonExistentPackage() {
        // Given
        when(packageRepository.findById(packageId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> packageService.activatePackage(packageId))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.PACKAGE_NOTEXISTED);
    }
}
