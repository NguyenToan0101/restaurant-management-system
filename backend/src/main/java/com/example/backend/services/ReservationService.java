package com.example.backend.services;

import com.example.backend.dto.ReservationDTO;

import com.example.backend.dto.request.ReservationConfirmationMailRequest;
import com.example.backend.entities.Reservation;
import com.example.backend.entities.Branch;
import com.example.backend.entities.AreaTable;
import com.example.backend.entities.ReservationStatus;
import com.example.backend.mapper.ReservationMapper;
import com.example.backend.repositories.ReservationRepository;
import com.example.backend.repositories.BranchRepository;
import com.example.backend.repositories.AreaTableRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BranchRepository branchRepository;
    private final AreaTableRepository areaTableRepository;
    private final MailService mailService;

    public List<ReservationDTO> getAll() {
        return reservationRepository.findAll()
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }


    public ReservationDTO getById(UUID id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        return ReservationMapper.toDTO(reservation);
    }


    public List<ReservationDTO> getByBranch(UUID branchId) {
        return reservationRepository.findByBranch_BranchId(branchId)
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }


    public List<ReservationDTO> getByTable(UUID tableId) {
        return reservationRepository.findByAreaTable_AreaTableId(tableId)
                .stream()
                .map(ReservationMapper::toDTO)
                .collect(Collectors.toList());
    }


    public ReservationDTO create(ReservationDTO dto) {

        Branch branch = branchRepository.findById(dto.getBranchId())
                .orElseThrow(() -> new RuntimeException("Branch not found"));

        AreaTable table = null;

        if (dto.getAreaTableId() != null) {
            table = areaTableRepository.findById(dto.getAreaTableId())
                    .orElseThrow(() -> new RuntimeException("Table not found"));
        }

        Reservation reservation = ReservationMapper.toEntity(dto);

        reservation.setBranch(branch);
        reservation.setAreaTable(table);
        reservation.setStatus(ReservationStatus.PENDING);
        reservation = reservationRepository.save(reservation);
        if (reservation.getCustomerEmail() != null
                && !reservation.getCustomerEmail().isBlank()) {

            ReservationConfirmationMailRequest mailRequest =
                    ReservationMapper.toMailRequest(reservation);

            mailService.sendReservationConfirmationMail(mailRequest);
        }
        return ReservationMapper.toDTO(reservation);
    }


    public ReservationDTO update(UUID id, ReservationDTO dto) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        reservation.setCustomerName(dto.getCustomerName());
        reservation.setCustomerPhone(dto.getCustomerPhone());
        reservation.setCustomerEmail(dto.getCustomerEmail());
        reservation.setGuestNumber(dto.getGuestNumber());
        reservation.setStartTime(dto.getStartTime());
        reservation.setNote(dto.getNote());
        reservation.setStatus(dto.getStatus());

        reservation = reservationRepository.save(reservation);

        return ReservationMapper.toDTO(reservation);
    }


    public void delete(UUID id) {
        reservationRepository.deleteById(id);
    }
}