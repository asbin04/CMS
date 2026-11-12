package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.PeopleMonthly;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PeopleMonthlyRepository extends JpaRepository<PeopleMonthly, Long> {
    List<PeopleMonthly> findAllByOrderBySortOrderAsc();
}

