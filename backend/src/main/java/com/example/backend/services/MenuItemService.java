package com.example.backend.services;

import com.example.backend.dto.CustomizationDTO;
import com.example.backend.dto.MenuItemDTO;
import com.example.backend.dto.request.MenuItemCreateRequest;
import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CustomizationMapper;
import com.example.backend.mapper.MenuItemMapper;
import com.example.backend.repositories.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.Instant;
import java.util.*;
import java.util.function.Supplier;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final MenuItemMapper menuItemMapper;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final CustomizationRepository customizationRepository;
    private final BranchMenuItemRepository branchMenuItemRepository;
    private final MediaService mediaService;
    private final CustomizationMapper customizationMapper;

    public MenuItemService(MenuItemRepository menuItemRepository, MenuItemMapper menuItemMapper,
                           RestaurantRepository restaurantRepository, CategoryRepository categoryRepository,
                           CustomizationRepository customizationRepository, BranchMenuItemRepository branchMenuItemRepository,
                           MediaService mediaService,
                           CustomizationMapper customizationMapper) {
        this.menuItemRepository = menuItemRepository;
        this.menuItemMapper = menuItemMapper;
        this.restaurantRepository = restaurantRepository;
        this.categoryRepository = categoryRepository;
        this.customizationRepository = customizationRepository;
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.mediaService = mediaService;
        this.customizationMapper = customizationMapper;
    }

    public List<MenuItemDTO> getAllByRestaurant(UUID restaurantId) {
        List<EntityStatus> allowedStatuses = Arrays.asList(EntityStatus.ACTIVE, EntityStatus.INACTIVE);
        List<MenuItem> list = menuItemRepository.findAllByRestaurant_RestaurantIdAndStatusIn(restaurantId, allowedStatuses);

        if (list.isEmpty()) return Collections.emptyList();

        return list.stream().map(item -> {
            MenuItemDTO dto = menuItemMapper.toMenuItemDTO(item);
            dto.setImageUrl(mediaService.getImageUrlByTarget(item.getMenuItemId(), "MENU_ITEM_IMAGE"));
            return dto;
        }).toList();
    }

    public MenuItemDTO getById(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
        MenuItemDTO dto = menuItemMapper.toMenuItemDTO(item);
        dto.setImageUrl(mediaService.getImageUrlByTarget(id, "MENU_ITEM_IMAGE"));
        return dto;
    }

    @Transactional
    public MenuItemDTO create(MenuItemCreateRequest request, MultipartFile imageFile) {
        Restaurant restaurant = restaurantRepository.findById(request.getRestaurantId())
                .orElseThrow(() -> new AppException(ErrorCode.RESTAURANT_NOTEXISTED));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));

        // Tạo MenuItem cơ bản
        MenuItem item = new MenuItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setBestSeller(request.isBestSeller());
        item.setStatus(EntityStatus.ACTIVE);
        item.setRestaurant(restaurant);
        item.setCategory(category);     
        item.setCreatedAt(Instant.now());

        if (request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()) {
            Set<Customization> customizations = request.getCustomizationIds().stream()
                    .map(id -> customizationRepository.findById(id)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            item.setCustomizations(customizations);
            item.setHasCustomization(true);
        } else {
            item.setHasCustomization(false);
        }

        MenuItem savedItem = menuItemRepository.save(item);

        if (imageFile != null && !imageFile.isEmpty()) {
            mediaService.saveMediaForTarget(imageFile, savedItem.getMenuItemId(), "MENU_ITEM_IMAGE");
        }

        Set<Branch> branches = restaurant.getBranches();
        if (branches != null && !branches.isEmpty()) {
            for (Branch branch : branches) {
                BranchMenuItem bmi = new BranchMenuItem();
                bmi.setBranch(branch);
                bmi.setMenuItem(savedItem);
                bmi.setAvailable(true); //forgot to auto save true TT
                branchMenuItemRepository.save(bmi);
            }
        }

        return menuItemMapper.toMenuItemDTO(savedItem);
    }

    @Transactional
    public MenuItemDTO update(UUID id, MenuItemCreateRequest request, MultipartFile imageFile) {
        MenuItem existing = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));

        existing.setName(request.getName());
        existing.setDescription(request.getDescription());
        existing.setPrice(request.getPrice());
        existing.setBestSeller(request.isBestSeller());
        existing.setUpdatedAt(Instant.now());

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.CATEGORY_NOT_FOUND));
            existing.setCategory(category);
        } else {
            existing.setCategory(null);
        }

        // Clear existing customizations first
        existing.getCustomizations().clear();

        if (request.getCustomizationIds() != null && !request.getCustomizationIds().isEmpty()) {
            Set<Customization> customizations = request.getCustomizationIds().stream()
                    .map(id2 -> customizationRepository.findById(id2)
                            .orElseThrow(() -> new AppException(ErrorCode.CUSTOMIZATION_NOT_FOUND)))
                    .collect(Collectors.toSet());
            existing.getCustomizations().addAll(customizations);
            existing.setHasCustomization(true);
        } else {
            existing.setHasCustomization(false);
        }

        MenuItem updated = menuItemRepository.save(existing);

        if (imageFile != null && !imageFile.isEmpty()) {
            mediaService.deleteAllMediaForTarget(updated.getMenuItemId(), "MENU_ITEM_IMAGE");
            mediaService.saveMediaForTarget(imageFile, updated.getMenuItemId(), "MENU_ITEM_IMAGE");
        }

        MenuItemDTO dto = menuItemMapper.toMenuItemDTO(updated);
        dto.setImageUrl(mediaService.getImageUrlByTarget(updated.getMenuItemId(), "MENU_ITEM_IMAGE"));
        return dto;
    }

    @Transactional
    public MenuItemDTO setActiveStatus(UUID menuItemId, boolean active) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));

        item.setStatus(active ? EntityStatus.ACTIVE : EntityStatus.INACTIVE);
        item.setUpdatedAt(Instant.now());

        MenuItem updated = menuItemRepository.save(item);
        return menuItemMapper.toMenuItemDTO(updated);
    }

    @Transactional
    public void delete(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));

        item.setStatus(EntityStatus.DELETED);
        item.setUpdatedAt(Instant.now());
        menuItemRepository.save(item);

        mediaService.deleteAllMediaForTarget(id, "MENU_ITEM_IMAGE");

        List<BranchMenuItem> mappings = branchMenuItemRepository.findAll()
                .stream()
                .filter(bmi -> bmi.getMenuItem().getMenuItemId().equals(id))
                .toList();
        branchMenuItemRepository.deleteAll(mappings);
    }


    public boolean isMenuItemActiveInBranch(UUID menuItemId, UUID branchId) {
        return branchMenuItemRepository.existsByBranch_BranchIdAndMenuItem_MenuItemIdAndAvailableTrue(branchId, menuItemId);
    }

    @Transactional
    public MenuItemDTO updateBestSeller(UUID menuItemId, boolean bestSeller) {
        MenuItem item = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));

        item.setBestSeller(bestSeller);
        item.setUpdatedAt(Instant.now());

        MenuItem updated = menuItemRepository.save(item);

        MenuItemDTO dto = menuItemMapper.toMenuItemDTO(updated);
        dto.setImageUrl(mediaService.getImageUrlByTarget(updated.getMenuItemId(), "MENU_ITEM_IMAGE"));
        return dto;
    }

    // @Transactional
    // public boolean canCreateMenuItem(UUID restaurantId) {
    //     Supplier<Long> currentCountSupplier = () ->
    //             menuItemRepository.countByRestaurant_RestaurantIdAndStatusNot(restaurantId, MenuItemStatus.DELETED);

    //     return featureLimitCheckerService.isUnderLimit(
    //             restaurantId,
    //             FeatureCode.LIMIT_MENU_ITEMS,
    //             currentCountSupplier
    //     );
    // }

    public List<CustomizationDTO> getCustomizationOfMenuItem(UUID menuItemId) {
        MenuItem menuItem = menuItemRepository.findById(menuItemId)
                .orElseThrow(() -> new AppException(ErrorCode.MENUITEM_NOT_FOUND));
        
        Set<Customization> customizations = new LinkedHashSet<>();
        
        // Nếu hasCustomization = true, lấy customizations từ category
        if (menuItem.isHasCustomization() && menuItem.getCategory() != null) {
            customizations.addAll(menuItem.getCategory().getCustomizations());
        }
        
        // Thêm customizations riêng của menu item (nếu có)
        customizations.addAll(menuItem.getCustomizations());
        
        // Filter chỉ lấy customizations ACTIVE
        return customizations.stream()
                .filter(c -> c.getStatus() == EntityStatus.ACTIVE)
                .map(customizationMapper::toCustomizationDTOForBranchMenuItem)
                .toList();
    }
    
}