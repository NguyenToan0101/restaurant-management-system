package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.WaiterMenuService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/waiter/menu")
public class WaiterMenuController {

    private final WaiterMenuService waiterMenuService;

    public WaiterMenuController(WaiterMenuService waiterMenuService) {
        this.waiterMenuService = waiterMenuService;
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<Map<String, Object>>> getMenuForBranch(@PathVariable UUID branchId) {
        return ApiResponse.success(waiterMenuService.getMenuItemsForBranch(branchId));
    }

    @GetMapping("/branch/{branchId}/categories")
    public ApiResponse<List<Map<String, Object>>> getCategoriesForBranch(@PathVariable UUID branchId) {
        return ApiResponse.success(waiterMenuService.getCategoriesForBranch(branchId));
    }
}
