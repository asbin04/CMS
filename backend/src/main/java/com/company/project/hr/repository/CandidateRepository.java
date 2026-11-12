package com.company.project.hr.repository;

import com.company.project.hr.entity.CandidateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface CandidateRepository extends JpaRepository<CandidateEntity, String> {

    List<CandidateEntity> findByDepartment(String department);

    List<CandidateEntity> findByStatus(String status);

    List<CandidateEntity> findByDepartmentAndStatus(String department, String status);

    long countByStatus(String status);

    long countByDepartmentAndStatus(String department, String status);

    long countByStatusAndCreatedDateBefore(String status, LocalDate cutoffDate);

    long countByDepartmentAndStatusAndCreatedDateBefore(String department, String status, LocalDate cutoffDate);

    @Query("SELECT COUNT(c) FROM CandidateEntity c WHERE c.status NOT IN ('Hired', 'Rejected') AND c.createdDate <= :cutoff")
    long countActiveCandidatesOlderThan(@Param("cutoff") LocalDate cutoff);

    @Query("SELECT COUNT(c) FROM CandidateEntity c WHERE c.department = :department AND c.status NOT IN ('Hired', 'Rejected') AND c.createdDate <= :cutoff")
    long countActiveCandidatesByDepartmentOlderThan(@Param("department") String department, @Param("cutoff") LocalDate cutoff);
}
