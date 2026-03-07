package com.example.backend.repositories;


import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entities.Branch;
import com.example.backend.entities.StaffAccount;
import com.example.backend.entities.RoleName;



@Repository
public interface StaffAccountRepository extends JpaRepository<StaffAccount, UUID> {

    // Lấy nhân viên theo chi nhánh, loại bỏ vai trò Manager (cho Branch Manager)
    Page<StaffAccount> findByBranchAndRole_NameNot(Branch branch, RoleName roleName, Pageable pageable);

    // Lấy nhân viên theo toàn bộ nhà hàng (cho Restaurant Owner)
    Page<StaffAccount> findByBranch_Restaurant_RestaurantId(UUID restaurantId, Pageable pageable);

    // Đếm số lượng nhân viên theo vai trò trong chi nhánh (cho Thống kê)
    long countByBranchAndRole_Name(Branch branch, RoleName roleName);

    // Đếm số lượng nhân viên trong chi nhánh, loại bỏ một vai trò cụ thể (ví dụ BRANCH_MANAGER)
    long countByBranchAndRole_NameNot(Branch branch, RoleName roleName);
}