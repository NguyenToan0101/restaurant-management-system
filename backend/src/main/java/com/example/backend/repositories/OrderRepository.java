package com.example.backend.repositories;

import com.example.backend.entities.Order;
import com.example.backend.entities.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

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
}
