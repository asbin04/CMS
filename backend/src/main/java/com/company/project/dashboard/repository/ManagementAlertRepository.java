package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.ManagementAlert;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ManagementAlertRepository extends JpaRepository<ManagementAlert, Long> {
    List<ManagementAlert> findAllByOrderBySortOrderAsc();
}

