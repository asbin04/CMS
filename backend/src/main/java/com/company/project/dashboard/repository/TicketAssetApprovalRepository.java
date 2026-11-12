package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.TicketAssetApproval;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketAssetApprovalRepository extends JpaRepository<TicketAssetApproval, Long> {
    List<TicketAssetApproval> findAllByOrderBySortOrderAscIdAsc();
    long countByStatusIgnoreCase(String status);
}

