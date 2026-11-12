package com.company.project.settings.repository;

import com.company.project.settings.entity.UserSessionEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserSessionRepository extends JpaRepository<UserSessionEntity, UUID> {

    List<UserSessionEntity> findByUserKeyIgnoreCaseAndActiveTrueOrderByLastActiveAtDesc(String userKey);

    List<UserSessionEntity> findByUserKeyIgnoreCaseOrderByLastActiveAtDesc(String userKey);

    Optional<UserSessionEntity> findByTokenFingerprint(String tokenFingerprint);

    long countByUserKeyIgnoreCaseAndActiveTrue(String userKey);
}

