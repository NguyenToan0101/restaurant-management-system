package com.example.backend.repositories;

import com.example.backend.entities.EntityStatus;
import com.example.backend.entities.OrderItem;
import com.example.backend.entities.OrderLineStatus;
import com.example.backend.entities.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, UUID> {

    List<OrderItem> findByOrderLine_OrderLineId(UUID orderLineId);
    
    @Query("SELECT CASE WHEN COUNT(oi) > 0 THEN true ELSE false END " +
           "FROM OrderItem oi " +
           "JOIN oi.orderLine ol " +
           "JOIN ol.order o " +
           "WHERE oi.menuItem.menuItemId = :menuItemId " +
           "AND oi.status = :orderItemStatus " +
           "AND ol.orderLineStatus IN :activeOrderLineStatuses " +
           "AND o.status = :orderStatus")
    boolean existsActiveOrderItemByMenuItemId(
        @Param("menuItemId") UUID menuItemId,
        @Param("orderItemStatus") EntityStatus orderItemStatus,
        @Param("activeOrderLineStatuses") List<OrderLineStatus> activeOrderLineStatuses,
        @Param("orderStatus") OrderStatus orderStatus
    );
}
