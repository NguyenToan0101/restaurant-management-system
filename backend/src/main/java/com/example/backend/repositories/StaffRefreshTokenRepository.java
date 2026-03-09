package com.example.backend.repositories;

import com.example.backend.entities.StaffRefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
public interface StaffRefreshTokenRepository extends JpaRepository<StaffRefreshToken, String> {
    void deleteByExpiresAtBefore(Instant now);
    void deleteByStaffAccount_StaffAccountId(UUID staffAccountId);
}
