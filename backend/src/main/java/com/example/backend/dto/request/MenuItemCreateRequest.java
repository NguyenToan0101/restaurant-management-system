package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.util.Set;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemCreateRequest {
    private String name;
    private String description;
    private BigDecimal price;
    private boolean bestSeller;
    private boolean hasCustomization;
    private UUID restaurantId;
    private UUID categoryId;
    private Set<UUID> customizationIds;

}