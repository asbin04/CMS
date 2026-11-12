package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.ProjectStatusDistribution;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectStatusDistributionRepository extends JpaRepository<ProjectStatusDistribution, Long> {
    List<ProjectStatusDistribution> findAllByOrderBySortOrderAsc();
}

