package com.example.backend.repositories;

import com.example.backend.entities.Bill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    Optional<Bill> findByOrder_OrderId(UUID orderId);

    @Query("SELECT b FROM Bill b WHERE b.branch.branchId = :branchId ORDER BY b.paidTime DESC")
    List<Bill> findByBranch_BranchIdOrderByPaidTimeDesc(@Param("branchId") UUID branchId);
}
