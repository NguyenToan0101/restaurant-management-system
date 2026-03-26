package com.example.backend.service;

import com.example.backend.dto.CategoryDTO;
import com.example.backend.dto.request.CategoryCreateRequest;
import com.example.backend.entities.Category;
import com.example.backend.entities.Customization;
import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.Restaurant;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CategoryMapper;
import com.example.backend.repositories.CategoryRepository;
import com.example.backend.repositories.CustomizationRepository;
import com.example.backend.repositories.RestaurantRepository;
import com.example.backend.services.CategoryService;
import com.example.backend.services.OwnershipValidationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Unit tests for CategoryService using Mockito
 * Tests business logic with mocked dependencies
 */
@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private CustomizationRepository customizationRepository;

    @Mock
    private OwnershipValidationService ownershipValidationService;

    @InjectMocks
    private CategoryService categoryService;

    private UUID restaurantId;
    private UUID categoryId;
    private Restaurant testRestaurant;
    private Category testCategory;
    private CategoryDTO testCategoryDTO;

    @BeforeEach
    void setUp() {
        restaurantId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(restaurantId);
        testRestaurant.setName("Test Restaurant");

        testCategory = new Category();
        testCategory.setCategoryId(categoryId);
        testCategory.setName("Appetizers");
        testCategory.setRestaurant(testRestaurant);
        testCategory.setStatus(EntityStatus.ACTIVE);
        testCategory.setCreatedAt(Instant.now());

        testCategoryDTO = new CategoryDTO();
        testCategoryDTO.setId(categoryId);
        testCategoryDTO.setName("Appetizers");
        testCategoryDTO.setRestaurantId(restaurantId);
    }

    @Test
    @DisplayName("Should get all categories by restaurant with ownership validation")
    void testGetAllByRestaurant() {
        // Given
        List<Category> categories = Arrays.asList(testCategory);
        when(categoryRepository.findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE))
            .thenReturn(categories);
        when(categoryMapper.toCategoryDTO(testCategory)).thenReturn(testCategoryDTO);
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);

        // When
        List<CategoryDTO> result = categoryService.getAllByRestaurant(restaurantId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Appetizers");
        verify(ownershipValidationService).validateRestaurantOwnership(restaurantId);
        verify(categoryRepository).findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should get categories by restaurant without ownership validation")
    void testGetByRestaurant() {
        // Given
        List<Category> categories = Arrays.asList(testCategory);
        when(categoryRepository.findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE))
            .thenReturn(categories);
        when(categoryMapper.toCategoryDTO(testCategory)).thenReturn(testCategoryDTO);

        // When
        List<CategoryDTO> result = categoryService.getByRestaurant(restaurantId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Appetizers");
        verify(categoryRepository).findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE);
        verifyNoInteractions(ownershipValidationService);
    }

    @Test
    @DisplayName("Should get category by ID with ownership validation")
    void testGetById() {
        // Given
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        when(categoryMapper.toCategoryDTO(testCategory)).thenReturn(testCategoryDTO);
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);

        // When
        CategoryDTO result = categoryService.getById(categoryId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Appetizers");
        verify(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
    }

    @Test
    @DisplayName("Should throw exception when category not found")
    void testGetByIdNotFound() {
        // Given
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.getById(categoryId))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_NOT_FOUND);
    }

    @Test
    @DisplayName("Should create category successfully")
    void testCreate() {
        // Given
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setName("New Category");
        request.setRestaurantId(restaurantId);
        request.setCustomizationIds(new HashSet<>());

        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(testRestaurant));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toCategoryDTO(testCategory)).thenReturn(testCategoryDTO);

        // When
        CategoryDTO result = categoryService.create(request);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Appetizers");
        verify(restaurantRepository).findById(restaurantId);
        verify(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should throw exception when restaurant not found during create")
    void testCreateRestaurantNotFound() {
        // Given
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setRestaurantId(restaurantId);
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.create(request))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESTAURANT_NOTEXISTED);
    }

    @Test
    @DisplayName("Should create category with customizations")
    void testCreateWithCustomizations() {
        // Given
        UUID customizationId = UUID.randomUUID();
        CategoryCreateRequest request = new CategoryCreateRequest();
        request.setName("New Category");
        request.setRestaurantId(restaurantId);
        request.setCustomizationIds(new HashSet<>(Arrays.asList(customizationId)));

        Customization customization = new Customization();
        customization.setCustomizationId(customizationId);
        customization.setName("Extra Cheese");

        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(testRestaurant));
        when(customizationRepository.findById(customizationId)).thenReturn(Optional.of(customization));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toCategoryDTO(testCategory)).thenReturn(testCategoryDTO);

        // When
        CategoryDTO result = categoryService.create(request);

        // Then
        assertThat(result).isNotNull();
        verify(customizationRepository).findById(customizationId);
    }

    @Test
    @DisplayName("Should update category successfully")
    void testUpdate() {
        // Given
        CategoryDTO updateDTO = new CategoryDTO();
        updateDTO.setName("Updated Category");
        updateDTO.setCustomizationIds(new HashSet<>());

        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);
        when(categoryMapper.toCategoryDTO(testCategory)).thenReturn(testCategoryDTO);

        // When
        CategoryDTO result = categoryService.update(categoryId, updateDTO);

        // Then
        assertThat(result).isNotNull();
        verify(categoryRepository).findById(categoryId);
        verify(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should throw exception when updating non-existent category")
    void testUpdateNotFound() {
        // Given
        CategoryDTO updateDTO = new CategoryDTO();
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> categoryService.update(categoryId, updateDTO))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.CATEGORY_NOT_FOUND);
    }

    @Test
    @DisplayName("Should soft delete category")
    void testDelete() {
        // Given
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(categoryRepository.save(any(Category.class))).thenReturn(testCategory);

        // When
        categoryService.delete(categoryId);

        // Then
        verify(categoryRepository).findById(categoryId);
        verify(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should handle delete when category not found")
    void testDeleteNotFound() {
        // Given
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.empty());

        // When
        categoryService.delete(categoryId);

        // Then
        verify(categoryRepository).findById(categoryId);
        verify(categoryRepository, never()).save(any());
        verifyNoInteractions(ownershipValidationService);
    }

    @Test
    @DisplayName("Should return empty list when no categories found")
    void testGetAllByRestaurantEmpty() {
        // Given
        when(categoryRepository.findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE))
            .thenReturn(Collections.emptyList());
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);

        // When
        List<CategoryDTO> result = categoryService.getAllByRestaurant(restaurantId);

        // Then
        assertThat(result).isEmpty();
        verify(categoryRepository).findAllByRestaurantAndStatus(restaurantId, EntityStatus.ACTIVE);
    }
}
