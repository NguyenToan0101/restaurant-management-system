package com.example.backend.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.ReservationDTO;
import com.example.backend.dto.response.ApiResponse;
import com.example.backend.services.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @GetMapping
    public ApiResponse<List<ReservationDTO>> getAll() {
        ApiResponse<List<ReservationDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.getAll());
        return res;
    }

    @GetMapping("/{id}")
    public ApiResponse<ReservationDTO> getById(@PathVariable UUID id) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.getById(id));
        return res;
    }

    @GetMapping("/branch/{branchId}")
    public ApiResponse<List<ReservationDTO>> getByBranch(@PathVariable UUID branchId) {
        ApiResponse<List<ReservationDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.getByBranch(branchId));
        return res;
    }

    @GetMapping("/table/{tableId}")
    public ApiResponse<List<ReservationDTO>> getByTable(@PathVariable UUID tableId) {
        ApiResponse<List<ReservationDTO>> res = new ApiResponse<>();
        res.setResult(reservationService.getByTable(tableId));
        return res;
    }

    @PostMapping
    public ApiResponse<ReservationDTO> create(@RequestBody ReservationDTO dto) {
        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.create(dto));
        return res;
    }

    @PutMapping("/{id}")
    public ApiResponse<ReservationDTO> update(
            @PathVariable UUID id,
            @RequestBody ReservationDTO dto) {

        ApiResponse<ReservationDTO> res = new ApiResponse<>();
        res.setResult(reservationService.update(id, dto));
        return res;
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable UUID id) {
        reservationService.delete(id);
        return new ApiResponse<>();
    }
}
