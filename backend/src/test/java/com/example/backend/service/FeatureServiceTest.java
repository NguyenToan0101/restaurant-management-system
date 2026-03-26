package com.example.backend.service;

import com.example.backend.dto.FeatureDTO;
import com.example.backend.entities.Feature;
import com.example.backend.entities.FeatureCode;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.FeatureMapper;
import com.example.backend.repositories.FeatureRepository;
import com.example.backend.services.FeatureService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for FeatureService using Mockito
 */
@ExtendWith(MockitoExtension.class)
class FeatureServiceTest {

    @Mock
    private FeatureRepository featureRepository;

    @Mock
    private FeatureMapper featureMapper;

    @InjectMocks
    private FeatureService featureService;

    private Feature limitFeature;
    private Feature descriptiveFeature;
    private FeatureDTO limitFeatureDTO;
    private FeatureDTO descriptiveFeatureDTO;

    @BeforeEach
    void setUp() {
        // Limit feature (has FeatureCode)
        limitFeature = new Feature();
        limitFeature.setFeatureId(UUID.randomUUID());
        limitFeature.setName("Menu Items Limit");
        limitFeature.setDescription("Maximum number of menu items");
        limitFeature.setCode(FeatureCode.LIMIT_MENU_ITEMS);

        limitFeatureDTO = new FeatureDTO();
        limitFeatureDTO.setId(limitFeature.getFeatureId());
        limitFeatureDTO.setName("Menu Items Limit");
        limitFeatureDTO.setDescription("Maximum number of menu items");
        limitFeatureDTO.setCode(FeatureCode.LIMIT_MENU_ITEMS);

        // Descriptive feature (no FeatureCode)
        descriptiveFeature = new Feature();
        descriptiveFeature.setFeatureId(UUID.randomUUID());
        descriptiveFeature.setName("24/7 Support");
        descriptiveFeature.setDescription("Round the clock customer support");
        descriptiveFeature.setCode(null);

        descriptiveFeatureDTO = new FeatureDTO();
        descriptiveFeatureDTO.setId(descriptiveFeature.getFeatureId());
        descriptiveFeatureDTO.setName("24/7 Support");
        descriptiveFeatureDTO.setDescription("Round the clock customer support");
        descriptiveFeatureDTO.setCode(null);
    }

    @Test
    @DisplayName("Should get all available features")
    void testGetAllAvailableFeatures() {
        // Given
        List<Feature> features = Arrays.asList(limitFeature, descriptiveFeature);
        when(featureRepository.findAll()).thenReturn(features);
        when(featureMapper.toFeatureDto(limitFeature)).thenReturn(limitFeatureDTO);
        when(featureMapper.toFeatureDto(descriptiveFeature)).thenReturn(descriptiveFeatureDTO);

        // When
        List<FeatureDTO> result = featureService.getAllAvailableFeatures();

        // Then
        assertThat(result).hasSize(2);
        verify(featureRepository).findAll();
        verify(featureMapper, times(2)).toFeatureDto(any(Feature.class));
    }

    @Test
    @DisplayName("Should get only limit features")
    void testGetLimitFeatures() {
        // Given
        List<Feature> features = Arrays.asList(limitFeature, descriptiveFeature);
        when(featureRepository.findAll()).thenReturn(features);
        when(featureMapper.toFeatureDto(limitFeature)).thenReturn(limitFeatureDTO);

        // When
        List<FeatureDTO> result = featureService.getLimitFeatures();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isEqualTo(FeatureCode.LIMIT_MENU_ITEMS);
        verify(featureRepository).findAll();
    }

    @Test
    @DisplayName("Should get only descriptive features")
    void testGetDescriptiveFeatures() {
        // Given
        List<Feature> features = Arrays.asList(limitFeature, descriptiveFeature);
        when(featureRepository.findAll()).thenReturn(features);
        when(featureMapper.toFeatureDto(descriptiveFeature)).thenReturn(descriptiveFeatureDTO);

        // When
        List<FeatureDTO> result = featureService.getDescriptiveFeatures();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCode()).isNull();
        verify(featureRepository).findAll();
    }

    @Test
    @DisplayName("Should find existing feature by ID")
    void testCreateOrFindFeatureById() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setId(limitFeature.getFeatureId());

        when(featureRepository.findById(limitFeature.getFeatureId())).thenReturn(Optional.of(limitFeature));

        // When
        Feature result = featureService.createOrFindFeature(dto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getFeatureId()).isEqualTo(limitFeature.getFeatureId());
        verify(featureRepository).findById(limitFeature.getFeatureId());
    }

    @Test
    @DisplayName("Should throw exception when feature ID not found")
    void testCreateOrFindFeatureByIdNotFound() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setId(UUID.randomUUID());

        when(featureRepository.findById(dto.getId())).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> featureService.createOrFindFeature(dto))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FEATURE_NOTEXISTED);
    }

    @Test
    @DisplayName("Should find existing feature by code")
    void testCreateOrFindFeatureByCode() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setName("Menu Items Limit"); // Need name for validation
        dto.setCode(FeatureCode.LIMIT_MENU_ITEMS);

        when(featureRepository.findByCode(FeatureCode.LIMIT_MENU_ITEMS)).thenReturn(Optional.of(limitFeature));

        // When
        Feature result = featureService.createOrFindFeature(dto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo(FeatureCode.LIMIT_MENU_ITEMS);
        verify(featureRepository).findByCode(FeatureCode.LIMIT_MENU_ITEMS);
    }

    @Test
    @DisplayName("Should throw exception when feature code not found")
    void testCreateOrFindFeatureByCodeNotFound() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setName("Menu Items Limit"); // Need name for validation
        dto.setCode(FeatureCode.LIMIT_MENU_ITEMS);

        when(featureRepository.findByCode(FeatureCode.LIMIT_MENU_ITEMS)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> featureService.createOrFindFeature(dto))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FEATURE_NOTEXISTED);
    }

    @Test
    @DisplayName("Should create new descriptive feature by name")
    void testCreateNewDescriptiveFeature() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setName("New Feature");
        dto.setDescription("New feature description");

        when(featureRepository.findByName("New Feature")).thenReturn(Optional.empty());
        when(featureRepository.save(any(Feature.class))).thenReturn(descriptiveFeature);

        // When
        Feature result = featureService.createOrFindFeature(dto);

        // Then
        assertThat(result).isNotNull();
        verify(featureRepository).findByName("New Feature");
        verify(featureRepository).save(any(Feature.class));
    }

    @Test
    @DisplayName("Should find existing descriptive feature by name")
    void testFindExistingDescriptiveFeatureByName() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setName("24/7 Support");

        when(featureRepository.findByName("24/7 Support")).thenReturn(Optional.of(descriptiveFeature));

        // When
        Feature result = featureService.createOrFindFeature(dto);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("24/7 Support");
        verify(featureRepository).findByName("24/7 Support");
        verify(featureRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw exception when feature name is empty")
    void testCreateOrFindFeatureWithEmptyName() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setName("");

        // When & Then
        assertThatThrownBy(() -> featureService.createOrFindFeature(dto))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FEATURE_NAME_EMPTY);
    }

    @Test
    @DisplayName("Should throw exception when feature name is null")
    void testCreateOrFindFeatureWithNullName() {
        // Given
        FeatureDTO dto = new FeatureDTO();
        dto.setName(null);

        // When & Then
        assertThatThrownBy(() -> featureService.createOrFindFeature(dto))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.FEATURE_NAME_EMPTY);
    }
}
