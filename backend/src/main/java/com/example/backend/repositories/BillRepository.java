package com.example.backend.repositories;

import com.example.backend.entities.Bill;
import com.example.backend.entities.PaymentMethod;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BillRepository extends JpaRepository<Bill, UUID> {

    Optional<Bill> findByOrder_OrderId(UUID orderId);

    @Query("SELECT b FROM Bill b WHERE b.branch.branchId = :branchId ORDER BY b.paidTime DESC")
    List<Bill> findByBranch_BranchIdOrderByPaidTimeDesc(@Param("branchId") UUID branchId);

    @Query("SELECT b FROM Bill b WHERE b.branch.branchId = :branchId " +
           "AND b.paidTime >= :startDate AND b.paidTime <= :endDate " +
           "ORDER BY b.paidTime DESC")
    List<Bill> findByBranchAndDateRange(@Param("branchId") UUID branchId, 
                                        @Param("startDate") Instant startDate, 
                                        @Param("endDate") Instant endDate);

    @EntityGraph(attributePaths = {"order", "order.areaTable", "branch"})
    @Query("SELECT b FROM Bill b LEFT JOIN b.order o LEFT JOIN o.areaTable t " +
           "WHERE b.branch.branchId = :branchId " +
           "AND (b.paidTime >= COALESCE(:startDate, b.paidTime)) " +
           "AND (b.paidTime <= COALESCE(:endDate, b.paidTime)) " +
           "AND (b.paymentMethod = COALESCE(:paymentMethod, b.paymentMethod)) " +
           "AND (COALESCE(:searchTerm, 'ALL') = 'ALL' OR LOWER(t.tag) LIKE :searchTerm OR LOWER(CAST(b.billId as string)) LIKE :searchTerm)")
    Page<Bill> searchBills(
            @Param("branchId") UUID branchId,
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            @Param("searchTerm") String searchTerm,
            Pageable pageable);

    @Query("SELECT COUNT(b) FROM Bill b WHERE b.branch.branchId = :branchId " +
           "AND b.paidTime >= :startDate AND b.paidTime < :endDate")
    long countByBranchAndDateRange(@Param("branchId") UUID branchId, 
                                   @Param("startDate") Instant startDate, 
                                   @Param("endDate") Instant endDate);
}
