package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.DashboardSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DashboardSettingsRepository extends JpaRepository<DashboardSettings, Long> {
}

