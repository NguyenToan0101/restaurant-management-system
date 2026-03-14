package com.example.backend.repositories;

import com.example.backend.entities.Reservation;
import com.example.backend.entities.Branch;
import com.example.backend.entities.AreaTable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    List<Reservation> findByBranch(Branch branch);

    List<Reservation> findByAreaTable(AreaTable areaTable);

    List<Reservation> findByBranch_BranchId(UUID branchId);

    List<Reservation> findByAreaTable_AreaTableId(UUID areaTableId);

}