package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;
import org.springframework.beans.factory.annotation.Value;

import com.example.backend.dto.RestaurantDTO;
import com.example.backend.entities.Restaurant;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public abstract class RestaurantMapper {

    @Value("${frontend.base-url}")
    private String webUrl;

    @Mapping(source = "user.userId", target = "userId")
    public abstract RestaurantDTO toRestaurantDto(Restaurant restaurant);

    @Mapping(source = "userId", target = "user.userId")
    public abstract Restaurant toRestaurant(RestaurantDTO dto);
    
    // Custom method to build full URL from slug
    protected String buildFullUrl(String slug) {
        if (slug == null || slug.isEmpty()) {
            return null;
        }
        // If already a full URL, return as-is
        if (slug.startsWith("http://") || slug.startsWith("https://")) {
            return slug;
        }
        // Build full URL from slug
        return webUrl + "/" + slug;
    }
    
    // Override to add full URL building
    public RestaurantDTO toRestaurantDtoWithFullUrl(Restaurant restaurant) {
        RestaurantDTO dto = toRestaurantDto(restaurant);
        if (dto != null && dto.getPublicUrl() != null) {
            dto.setPublicUrl(buildFullUrl(dto.getPublicUrl()));
        }
        return dto;
    }
}
