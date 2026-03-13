package com.example.backend.controller;

import com.example.backend.dto.AreaDTO;
import com.example.backend.dto.AreaTableDTO;
import com.example.backend.dto.BranchDTO;
import com.example.backend.dto.RestaurantDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.AreaService;
import com.example.backend.services.AreaTableService;
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
public class CustomerController {
    private final BranchService branchService;
    private final RestaurantService restaurantService;
    private final AreaService areaService;
    private final AreaTableService areaTableService;
    public CustomerController(BranchService branchService, RestaurantService restaurantService, AreaService areaService, AreaTableService areaTableService) {
        this.branchService = branchService;
        this.restaurantService = restaurantService;
        this.areaService = areaService;
        this.areaTableService = areaTableService;
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
        res.setResult(branchService.getByPublicRestaurant(restaurantId));
        return res;
    }
    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<AreaDTO>> getByBranch(@PathVariable UUID branchId) {
        ApiResponse<List<AreaDTO>> response = new ApiResponse<>();
        response.setResult(areaService.getByPublicBranch(branchId));
        return response;
    }
    @GetMapping("/tables/area/{areaId}")
    public ApiResponse<List<AreaTableDTO>> getByArea(@PathVariable UUID areaId) {
        ApiResponse<List<AreaTableDTO>> response = new ApiResponse<>();
        response.setResult(areaTableService.getByPublicArea(areaId));
        return response;
    }
    @GetMapping("/areas/branch/{branchId}")
    public ApiResponse<List<AreaDTO>> getByAreaBranch(@PathVariable UUID branchId) {
        ApiResponse<List<AreaDTO>> response = new ApiResponse<>();
        response.setResult(areaService.getByPublicBranch(branchId));
        return response;
    }

}
