package com.company.project.settings.repository;

import com.company.project.settings.entity.UserSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSettingsRepository extends JpaRepository<UserSettingsEntity, Long> {

    Optional<UserSettingsEntity> findByUserKeyIgnoreCase(String userKey);

    Optional<UserSettingsEntity> findByEmailIgnoreCase(String email);
}

