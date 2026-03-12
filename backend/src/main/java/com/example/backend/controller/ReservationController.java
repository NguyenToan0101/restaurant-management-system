package com.example.backend.controller;

import com.example.backend.dto.BranchDTO;
import com.example.backend.dto.RestaurantDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.BranchService;
import com.example.backend.services.RestaurantService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/public")
public class ReservationController {
    private final BranchService branchService;
    private final RestaurantService restaurantService;
    public ReservationController(BranchService branchService, RestaurantService restaurantService) {
        this.branchService = branchService;
        this.restaurantService = restaurantService;
    }
    @GetMapping("/restaurants/{slug}")
    public ApiResponse<RestaurantDTO> getBySlug(@PathVariable String slug) {
        ApiResponse<RestaurantDTO> res = new ApiResponse<>();
        res.setResult(restaurantService.getBySlug(slug));
        return res;
    }
    @GetMapping("/branches/restaurant/{restaurantId}")
    public ApiResponse<List<BranchDTO>> getByRestaurant(@PathVariable UUID restaurantId) {
        ApiResponse<List<BranchDTO>> res = new ApiResponse<>();
        res.setResult(branchService.getByRestaurant(restaurantId));
        return res;
    }
}
