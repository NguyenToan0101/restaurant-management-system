package com.example.backend.services;

import com.example.backend.entities.*;
import com.example.backend.exception.AppException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repositories.*;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WaiterMenuService {

    private final BranchMenuItemRepository branchMenuItemRepository;
    private final BranchRepository branchRepository;
    private final CategoryRepository categoryRepository;
    private final CustomizationRepository customizationRepository;
    private final MediaService mediaService;

    public WaiterMenuService(BranchMenuItemRepository branchMenuItemRepository,
                             BranchRepository branchRepository,
                             CategoryRepository categoryRepository,
                             CustomizationRepository customizationRepository,
                             MediaService mediaService) {
        this.branchMenuItemRepository = branchMenuItemRepository;
        this.branchRepository = branchRepository;
        this.categoryRepository = categoryRepository;
        this.customizationRepository = customizationRepository;
        this.mediaService = mediaService;
    }

    public List<Map<String, Object>> getMenuItemsForBranch(UUID branchId) {
        UUID restaurantId = branchRepository.findRestaurantIdByBranchId(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        List<BranchMenuItem> branchMenuItems = branchMenuItemRepository.findAllByBranch_BranchId(branchId);

        List<UUID> menuItemIds = branchMenuItems.stream()
                .filter(BranchMenuItem::isAvailable)
                .map(bmi -> bmi.getMenuItem().getMenuItemId())
                .collect(Collectors.toList());

        Map<UUID, String> imageUrls = mediaService.getLatestImageUrlsForTargets(menuItemIds, "MENU_ITEM_IMAGE");

        return branchMenuItems.stream()
                .filter(BranchMenuItem::isAvailable)
                .filter(bmi -> bmi.getMenuItem().getStatus() == EntityStatus.ACTIVE)
                .map(bmi -> {
                    MenuItem item = bmi.getMenuItem();
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("menuItemId", item.getMenuItemId().toString());
                    map.put("name", item.getName());
                    map.put("description", item.getDescription());
                    map.put("price", item.getPrice());
                    map.put("categoryId", item.getCategory().getCategoryId().toString());
                    map.put("categoryName", item.getCategory().getName());
                    map.put("isBestSeller", item.isBestSeller());
                    map.put("hasCustomization", item.isHasCustomization());
                    map.put("imageUrl", imageUrls.getOrDefault(item.getMenuItemId(), null));

                    List<Map<String, Object>> customizations = new ArrayList<>();
                    if (item.getCustomizations() != null) {
                        for (Customization c : item.getCustomizations()) {
                            if (c.getStatus() == EntityStatus.ACTIVE) {
                                Map<String, Object> custMap = new LinkedHashMap<>();
                                custMap.put("customizationId", c.getCustomizationId().toString());
                                custMap.put("name", c.getName());
                                custMap.put("price", c.getPrice());
                                customizations.add(custMap);
                            }
                        }
                    }
                    map.put("customizations", customizations);
                    return map;
                })
                .collect(Collectors.toList());
    }

    public List<Map<String, Object>> getCategoriesForBranch(UUID branchId) {
        UUID restaurantId = branchRepository.findRestaurantIdByBranchId(branchId)
                .orElseThrow(() -> new AppException(ErrorCode.BRANCH_NOTEXISTED));

        List<Category> categories = categoryRepository.findAllByRestaurantAndStatus(
                restaurantId, EntityStatus.ACTIVE);

        return categories.stream()
                .map(cat -> {
                    Map<String, Object> map = new LinkedHashMap<>();
                    map.put("categoryId", cat.getCategoryId().toString());
                    map.put("name", cat.getName());
                    return map;
                })
                .collect(Collectors.toList());
    }
}
