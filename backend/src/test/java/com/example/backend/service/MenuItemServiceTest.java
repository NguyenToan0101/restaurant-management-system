package com.example.backend.service;

import com.example.backend.dto.MenuItemDTO;
import com.example.backend.dto.request.MenuItemCreateRequest;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.MenuItemMapper;
import com.example.backend.repositories.*;
import com.example.backend.services.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Unit tests for MenuItemService using Mockito
 */
@ExtendWith(MockitoExtension.class)
class MenuItemServiceTest {

    @Mock
    private MenuItemRepository menuItemRepository;

    @Mock
    private MenuItemMapper menuItemMapper;

    @Mock
    private RestaurantRepository restaurantRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CustomizationRepository customizationRepository;

    @Mock
    private BranchMenuItemRepository branchMenuItemRepository;

    @Mock
    private MediaService mediaService;

    @Mock
    private FeatureLimitCheckerService featureLimitCheckerService;

    @Mock
    private OwnershipValidationService ownershipValidationService;

    @Mock
    private PromotionService promotionService;

    @InjectMocks
    private MenuItemService menuItemService;

    private UUID restaurantId;
    private UUID menuItemId;
    private UUID categoryId;
    private Restaurant testRestaurant;
    private MenuItem testMenuItem;
    private MenuItemDTO testMenuItemDTO;
    private Category testCategory;

    @BeforeEach
    void setUp() {
        restaurantId = UUID.randomUUID();
        menuItemId = UUID.randomUUID();
        categoryId = UUID.randomUUID();

        testRestaurant = new Restaurant();
        testRestaurant.setRestaurantId(restaurantId);
        testRestaurant.setName("Test Restaurant");

        testCategory = new Category();
        testCategory.setCategoryId(categoryId);
        testCategory.setName("Main Course");
        testCategory.setRestaurant(testRestaurant);

        testMenuItem = new MenuItem();
        testMenuItem.setMenuItemId(menuItemId);
        testMenuItem.setName("Burger");
        testMenuItem.setDescription("Delicious burger");
        testMenuItem.setPrice(new BigDecimal("10.99"));
        testMenuItem.setRestaurant(testRestaurant);
        testMenuItem.setCategory(testCategory);
        testMenuItem.setStatus(EntityStatus.ACTIVE);
        testMenuItem.setBestSeller(false);
        testMenuItem.setCreatedAt(Instant.now());

        testMenuItemDTO = new MenuItemDTO();
        testMenuItemDTO.setMenuItemId(menuItemId);
        testMenuItemDTO.setName("Burger");
        testMenuItemDTO.setDescription("Delicious burger");
        testMenuItemDTO.setPrice(new BigDecimal("10.99"));
        testMenuItemDTO.setRestaurantId(restaurantId);
        testMenuItemDTO.setCategoryId(categoryId);
    }

    @Test
    @DisplayName("Should get all menu items by restaurant with ownership validation")
    void testGetAllByRestaurant() {
        // Given
        List<MenuItem> menuItems = Arrays.asList(testMenuItem);
        when(menuItemRepository.findAllByRestaurant_RestaurantIdAndStatusIn(eq(restaurantId), anyList()))
            .thenReturn(menuItems);
        when(menuItemMapper.toMenuItemDTO(testMenuItem)).thenReturn(testMenuItemDTO);
        when(mediaService.getImageUrlByTarget(menuItemId, "MENU_ITEM_IMAGE")).thenReturn("http://image.url");
        when(promotionService.calculateItemDiscountedPriceByRestaurant(restaurantId, testMenuItem))
            .thenReturn(new BigDecimal("9.99"));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);

        // When
        List<MenuItemDTO> result = menuItemService.getAllByRestaurant(restaurantId);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Burger");
        verify(ownershipValidationService).validateRestaurantOwnership(restaurantId);
    }

    @Test
    @DisplayName("Should get menu items by restaurant without ownership validation")
    void testGetByRestaurant() {
        // Given
        List<MenuItem> menuItems = Arrays.asList(testMenuItem);
        when(menuItemRepository.findAllByRestaurant_RestaurantIdAndStatusIn(eq(restaurantId), anyList()))
            .thenReturn(menuItems);
        when(menuItemMapper.toMenuItemDTO(testMenuItem)).thenReturn(testMenuItemDTO);
        when(mediaService.getImageUrlByTarget(menuItemId, "MENU_ITEM_IMAGE")).thenReturn("http://image.url");
        when(promotionService.calculateItemDiscountedPriceByRestaurant(restaurantId, testMenuItem))
            .thenReturn(new BigDecimal("9.99"));

        // When
        List<MenuItemDTO> result = menuItemService.getByRestaurant(restaurantId);

        // Then
        assertThat(result).hasSize(1);
        verifyNoInteractions(ownershipValidationService);
    }

    @Test
    @DisplayName("Should get menu item by ID")
    void testGetById() {
        // Given
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(testMenuItem));
        when(menuItemMapper.toMenuItemDTO(testMenuItem)).thenReturn(testMenuItemDTO);
        when(mediaService.getImageUrlByTarget(menuItemId, "MENU_ITEM_IMAGE")).thenReturn("http://image.url");
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);

        // When
        MenuItemDTO result = menuItemService.getById(menuItemId);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Burger");
        verify(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
    }

    @Test
    @DisplayName("Should throw exception when menu item not found")
    void testGetByIdNotFound() {
        // Given
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> menuItemService.getById(menuItemId))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.MENUITEM_NOT_FOUND);
    }

    @Test
    @DisplayName("Should create menu item successfully")
    void testCreate() {
        // Given
        MenuItemCreateRequest request = new MenuItemCreateRequest();
        request.setName("New Item");
        request.setDescription("Description");
        request.setPrice(new BigDecimal("15.99"));
        request.setRestaurantId(restaurantId);
        request.setCategoryId(categoryId);
        request.setBestSeller(false);

        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.of(testRestaurant));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        doNothing().when(featureLimitCheckerService).checkLimit(eq(restaurantId), any(), any());
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);
        when(menuItemMapper.toMenuItemDTO(testMenuItem)).thenReturn(testMenuItemDTO);
        when(mediaService.getImageUrlByTarget(menuItemId, "MENU_ITEM_IMAGE")).thenReturn("http://image.url");

        // When
        MenuItemDTO result = menuItemService.create(request, null);

        // Then
        assertThat(result).isNotNull();
        verify(menuItemRepository).save(any(MenuItem.class));
        verify(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
    }

    @Test
    @DisplayName("Should throw exception when restaurant not found during create")
    void testCreateRestaurantNotFound() {
        // Given
        MenuItemCreateRequest request = new MenuItemCreateRequest();
        request.setRestaurantId(restaurantId);
        when(restaurantRepository.findById(restaurantId)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> menuItemService.create(request, null))
            .isInstanceOf(AppException.class)
            .hasFieldOrPropertyWithValue("errorCode", ErrorCode.RESTAURANT_NOTEXISTED);
    }

    @Test
    @DisplayName("Should update menu item successfully")
    void testUpdate() {
        // Given
        MenuItemCreateRequest request = new MenuItemCreateRequest();
        request.setName("Updated Item");
        request.setDescription("Updated Description");
        request.setPrice(new BigDecimal("20.99"));
        request.setCategoryId(categoryId);
        request.setBestSeller(true);

        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(testMenuItem));
        when(categoryRepository.findById(categoryId)).thenReturn(Optional.of(testCategory));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);
        when(menuItemMapper.toMenuItemDTO(testMenuItem)).thenReturn(testMenuItemDTO);
        when(mediaService.getImageUrlByTarget(menuItemId, "MENU_ITEM_IMAGE")).thenReturn("http://image.url");

        // When
        MenuItemDTO result = menuItemService.update(menuItemId, request, null);

        // Then
        assertThat(result).isNotNull();
        verify(menuItemRepository).save(any(MenuItem.class));
        verify(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
    }

    @Test
    @DisplayName("Should set menu item active status")
    void testSetActiveStatus() {
        // Given
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(testMenuItem));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);
        when(menuItemMapper.toMenuItemDTO(testMenuItem)).thenReturn(testMenuItemDTO);

        // When
        MenuItemDTO result = menuItemService.setActiveStatus(menuItemId, false);

        // Then
        assertThat(result).isNotNull();
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("Should soft delete menu item")
    void testDelete() {
        // Given
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(testMenuItem));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);
        doNothing().when(mediaService).deleteAllMediaForTarget(menuItemId, "MENU_ITEM_IMAGE");
        when(branchMenuItemRepository.findAll()).thenReturn(Collections.emptyList());

        // When
        menuItemService.delete(menuItemId);

        // Then
        verify(menuItemRepository).save(any(MenuItem.class));
        verify(mediaService).deleteAllMediaForTarget(menuItemId, "MENU_ITEM_IMAGE");
    }

    @Test
    @DisplayName("Should update best seller status")
    void testUpdateBestSeller() {
        // Given
        when(menuItemRepository.findById(menuItemId)).thenReturn(Optional.of(testMenuItem));
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(testRestaurant);
        when(menuItemRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);
        when(menuItemMapper.toMenuItemDTO(testMenuItem)).thenReturn(testMenuItemDTO);
        when(mediaService.getImageUrlByTarget(menuItemId, "MENU_ITEM_IMAGE")).thenReturn("http://image.url");

        // When
        MenuItemDTO result = menuItemService.updateBestSeller(menuItemId, true);

        // Then
        assertThat(result).isNotNull();
        verify(menuItemRepository).save(any(MenuItem.class));
    }

    @Test
    @DisplayName("Should return empty list when no menu items found")
    void testGetAllByRestaurantEmpty() {
        // Given
        when(menuItemRepository.findAllByRestaurant_RestaurantIdAndStatusIn(eq(restaurantId), anyList()))
            .thenReturn(Collections.emptyList());
        doNothing().when(ownershipValidationService).validateRestaurantOwnership(restaurantId);

        // When
        List<MenuItemDTO> result = menuItemService.getAllByRestaurant(restaurantId);

        // Then
        assertThat(result).isEmpty();
    }
}
