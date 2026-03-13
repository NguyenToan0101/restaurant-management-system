package com.example.backend.repositories;

import com.example.backend.entities.Order;
import com.example.backend.entities.OrderStatus;
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
public interface OrderRepository extends JpaRepository<Order, UUID> {

    @Query("SELECT o FROM Order o WHERE o.areaTable.areaTableId = :tableId AND o.status = :status")
    Optional<Order> findByAreaTable_AreaTableIdAndStatus(@Param("tableId") UUID tableId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o WHERE o.areaTable.areaTableId = :tableId ORDER BY o.createdAt DESC")
    List<Order> findByAreaTable_AreaTableIdOrderByCreatedAtDesc(@Param("tableId") UUID tableId);

    @Query("SELECT o FROM Order o JOIN o.areaTable t JOIN t.area a WHERE a.branch.branchId = :branchId AND o.status = :status ORDER BY o.createdAt DESC")
    List<Order> findByBranchIdAndStatus(@Param("branchId") UUID branchId, @Param("status") OrderStatus status);

    @Query("SELECT o FROM Order o JOIN o.areaTable t JOIN t.area a WHERE a.branch.branchId = :branchId ORDER BY o.createdAt DESC")
    List<Order> findByBranchId(@Param("branchId") UUID branchId);

    @Query("SELECT o FROM Order o JOIN o.areaTable t JOIN t.area a " +
           "WHERE a.branch.branchId = :branchId " +
           "AND (o.status = 'COMPLETED' OR o.status = 'CANCELLED') " +
           "ORDER BY o.createdAt DESC")
    List<Order> findHistoryByBranchId(@Param("branchId") UUID branchId);

    @EntityGraph(attributePaths = {"areaTable", "areaTable.area"})
    @Query("SELECT DISTINCT o FROM Order o JOIN o.areaTable t JOIN t.area a " +
           "WHERE a.branch.branchId = :branchId " +
           "AND (:status IS NULL OR o.status = :status) " +
           "AND (o.createdAt >= COALESCE(:startDate, o.createdAt)) " +
           "AND (o.createdAt <= COALESCE(:endDate, o.createdAt)) " +
           "AND (COALESCE(:searchTerm, 'ALL') = 'ALL' OR LOWER(t.tag) LIKE :searchTerm OR LOWER(CAST(o.orderId as string)) LIKE :searchTerm)")
    Page<Order> searchOrders(
            @Param("branchId") UUID branchId,
            @Param("status") OrderStatus status,
            @Param("searchTerm") String searchTerm,
            @Param("startDate") java.time.Instant startDate,
            @Param("endDate") java.time.Instant endDate,
            Pageable pageable);
}
