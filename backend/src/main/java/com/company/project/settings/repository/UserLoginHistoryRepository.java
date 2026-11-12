package com.company.project.settings.repository;

import com.company.project.settings.entity.UserLoginHistoryEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserLoginHistoryRepository extends JpaRepository<UserLoginHistoryEntity, UUID> {

    List<UserLoginHistoryEntity> findTop25ByUserKeyIgnoreCaseOrderByOccurredAtDesc(String userKey);

    Optional<UserLoginHistoryEntity> findTop1ByUserKeyIgnoreCaseAndEventTypeOrderByOccurredAtDesc(
            String userKey,
            String eventType
    );
}

