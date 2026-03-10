package com.example.backend.controller;

import com.example.backend.dto.response.ApiResponse;
import com.example.backend.dto.StaffAccountDTO;
import com.example.backend.dto.request.CreateStaffAccountRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.entities.RoleName;
import com.example.backend.services.StaffAccountService;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
public class StaffAccountController {

    private final StaffAccountService staffAccountService;

    public StaffAccountController(StaffAccountService staffAccountService) {
        this.staffAccountService = staffAccountService;
    }

    // ==========================================
    // 1. ENDPOINT DÙNG CHUNG (OWNER & MANAGER)
    // ==========================================

    // Lấy chi tiết một tài khoản nhân viên
    @GetMapping("/{staffAccountId}")
    public ApiResponse<StaffAccountDTO> getStaffAccountById(@PathVariable UUID staffAccountId) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getStaffAccountById(staffAccountId));
        return apiResponse;
    }

    // Tạo mới tài khoản nhân viên
    @PostMapping("")
    public ApiResponse<StaffAccountDTO> createStaffAccount(@Valid @RequestBody CreateStaffAccountRequest request) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.createStaffAccount(request));
        return apiResponse;
    }

    // Cập nhật thông tin tài khoản nhân viên
    @PutMapping("")
    public ApiResponse<StaffAccountDTO> updateStaffAccount(@RequestBody StaffAccountDTO staffAccountDTO) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.updateStaffAccount(staffAccountDTO));
        return apiResponse;
    }

    // Thay đổi trạng thái tài khoản (Kích hoạt / Vô hiệu hóa - Soft Delete)
    @DeleteMapping("/{staffAccountId}")
    public ApiResponse<StaffAccountDTO> setStaffAccountStatus(@PathVariable UUID staffAccountId) {
        ApiResponse<StaffAccountDTO> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.setStaffAccountStatus(staffAccountId));
        return apiResponse;
    }

    // ==========================================
    // 2. ENDPOINT CỦA CHỦ NHÀ HÀNG (OWNER)
    // ==========================================

    // Xem danh sách nhân viên trong một chi nhánh (Dành cho Owner - bao gồm cả Manager)
    @GetMapping("/owner/paginated")
    public ApiResponse<PageResponse<StaffAccountDTO>> getStaffByBranchForOwner(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam UUID branchId) {
        ApiResponse<PageResponse<StaffAccountDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getStaffAccountByBranchForOwnerPaginated(page, size, branchId));
        return apiResponse;
    }


    // ==========================================
    // 3. ENDPOINT CỦA QUẢN LÝ CHI NHÁNH (MANAGER)
    // ==========================================

    // Xem danh sách nhân viên trong chi nhánh (Loại bỏ chính Manager)
    @GetMapping("/manager/paginated")
    public ApiResponse<PageResponse<StaffAccountDTO>> getStaffByBranch(
            @RequestParam(required = false, defaultValue = "1") int page,
            @RequestParam(required = false, defaultValue = "10") int size,
            @RequestParam UUID branchId) {
        ApiResponse<PageResponse<StaffAccountDTO>> apiResponse = new ApiResponse<>();
        apiResponse.setResult(staffAccountService.getStaffAccountPaginated(page, size, branchId));
        return apiResponse;
    }

    // Các API Thống kê số lượng nhân viên trong chi nhánh
//    @GetMapping("/branch-manager/statistic/{branchId}")
//    public ApiResponse<String> getBranchStaffStatistic(@PathVariable UUID branchId) {
//        // Gom nhóm thống kê vào một API hoặc để lẻ như cũ tùy UI
//        long waiters = staffAccountService.getRoleNumber(branchId, RoleName.WAITER);
//        long receptionists = staffAccountService.getRoleNumber(branchId, RoleName.RECEPTIONIST);
//
//        ApiResponse<String> apiResponse = new ApiResponse<>();
//        apiResponse.setResult(String.format("Waiters: %d, Receptionists: %d", waiters, receptionists));
//        return apiResponse;
//    }
}