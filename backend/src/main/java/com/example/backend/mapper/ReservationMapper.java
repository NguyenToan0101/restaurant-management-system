package com.example.backend.mapper;

import com.example.backend.dto.ReservationDTO;
import com.example.backend.dto.request.ReservationConfirmationMailRequest;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.Branch;
import com.example.backend.entities.Reservation;

public class ReservationMapper {

    public static ReservationDTO toDTO(Reservation reservation) {

        if (reservation == null) {
            return null;
        }

        ReservationDTO dto = new ReservationDTO();

        dto.setReservationId(reservation.getReservationId());

        if (reservation.getBranch() != null) {
            dto.setBranchId(reservation.getBranch().getBranchId());
        }

        if (reservation.getAreaTable() != null) {
            dto.setAreaTableId(reservation.getAreaTable().getAreaTableId());
        }

        dto.setStartTime(reservation.getStartTime());
        dto.setCustomerName(reservation.getCustomerName());
        dto.setCustomerPhone(reservation.getCustomerPhone());
        dto.setCustomerEmail(reservation.getCustomerEmail());
        dto.setGuestNumber(reservation.getGuestNumber());
        dto.setNote(reservation.getNote());
        dto.setStatus(reservation.getStatus());
        dto.setCreatedAt(reservation.getCreatedAt());
        dto.setUpdatedAt(reservation.getUpdatedAt());

        return dto;
    }

    public static Reservation toEntity(ReservationDTO dto) {

        if (dto == null) {
            return null;
        }

        Reservation reservation = new Reservation();

        reservation.setReservationId(dto.getReservationId());
        reservation.setStartTime(dto.getStartTime());
        reservation.setCustomerName(dto.getCustomerName());
        reservation.setCustomerPhone(dto.getCustomerPhone());
        reservation.setCustomerEmail(dto.getCustomerEmail());
        reservation.setGuestNumber(dto.getGuestNumber());
        reservation.setNote(dto.getNote());
        reservation.setStatus(dto.getStatus());

        return reservation;
    }
    public static ReservationConfirmationMailRequest toMailRequest(
            Reservation reservation) {

        AreaTable table  = reservation.getAreaTable();
        Branch branch = reservation.getBranch();

        return ReservationConfirmationMailRequest.builder()
                .restaurantName(branch.getRestaurant().getName())
                .mail(reservation.getCustomerEmail())
                .customerName(reservation.getCustomerName())
                .customerPhone(reservation.getCustomerPhone())
                .reservationId(reservation.getReservationId())
                .startTime(reservation.getStartTime())
                .guestNumber(reservation.getGuestNumber())
                .note(reservation.getNote())
                .branchAddress(branch.getAddress())
                .tableTag(table != null ? table.getTag() : null)
                .tableCapacity(table != null ? table.getCapacity() : null)
                .build();
    }
}
