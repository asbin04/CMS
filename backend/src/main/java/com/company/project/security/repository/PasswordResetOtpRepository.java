package com.company.project.security.repository;

import com.company.project.security.entity.AppUser;
import com.company.project.security.entity.PasswordResetOtp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtp, UUID> {

    Optional<PasswordResetOtp> findTopByUserOrderByCreatedAtDesc(AppUser user);

    Optional<PasswordResetOtp> findByResetTokenHashAndUsedAtIsNull(String resetTokenHash);

    @org.springframework.transaction.annotation.Transactional
    @Modifying
    @Query("UPDATE PasswordResetOtp o SET o.usedAt = :usedAt WHERE o.user = :user AND o.usedAt IS NULL")
    void invalidateAllActiveForUser(@Param("user") AppUser user, @Param("usedAt") Instant usedAt);

    @org.springframework.transaction.annotation.Transactional
    @Modifying
    @Query("DELETE FROM PasswordResetOtp o WHERE o.expiresAt < :cutoff")
    void deleteExpiredBefore(@Param("cutoff") Instant cutoff);
}
