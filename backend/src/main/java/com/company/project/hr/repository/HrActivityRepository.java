package com.company.project.hr.repository;

import com.company.project.hr.entity.HrActivityEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface HrActivityRepository extends JpaRepository<HrActivityEntity, String> {
    List<HrActivityEntity> findAllByOrderBySortOrderAsc();

    @Query("SELECT a FROM HrActivityEntity a WHERE a.type IN ('Leave', 'Attendance', 'Employee') AND a.id NOT IN ('act-1', 'act-2', 'act-3', 'act-4', 'act-5') ORDER BY a.updatedAt DESC NULLS LAST, a.createdAt DESC NULLS LAST")
    List<HrActivityEntity> findAllOrderByNewestFirst();

    @Modifying
    @Transactional
    @Query("DELETE FROM HrActivityEntity a WHERE a.id IN ('act-1', 'act-2', 'act-3', 'act-4', 'act-5') OR a.type NOT IN ('Leave', 'Attendance', 'Employee')")
    int deleteOldAndInvalidActivities();
}
