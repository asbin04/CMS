package com.company.project.leave.repository;

import com.company.project.leave.entity.LeaveEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface LeaveRepository extends JpaRepository<LeaveEntity, String> {

    List<LeaveEntity> findAllByOrderByIdDesc();

    long countByApprovalStatusIgnoreCase(String approvalStatus);

    @Query("SELECT l.id FROM LeaveEntity l ORDER BY l.id DESC LIMIT 1")
    String findLatestId();
}

