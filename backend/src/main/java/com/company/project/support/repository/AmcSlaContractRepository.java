package com.company.project.support.repository;

import com.company.project.support.entity.AmcSlaContractEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface AmcSlaContractRepository extends JpaRepository<AmcSlaContractEntity, Long> {

    Optional<AmcSlaContractEntity> findByContractCode(String contractCode);

    @Query("SELECT c FROM AmcSlaContractEntity c WHERE " +
            "(:search IS NULL OR LOWER(c.contractCode) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "   OR LOWER(c.clientId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "   OR LOWER(c.clientName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "   OR LOWER(c.projectId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "   OR LOWER(c.projectName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "   OR LOWER(c.assignedManager) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) " +
            "   OR LOWER(c.notes) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) AND " +
            "(:serviceType IS NULL OR LOWER(c.serviceType) = LOWER(CAST(:serviceType AS string))) AND " +
            "(:status IS NULL OR LOWER(c.status) = LOWER(CAST(:status AS string))) AND " +
            "(:renewalAlert IS NULL OR LOWER(c.renewalAlert) = LOWER(CAST(:renewalAlert AS string))) AND " +
            "(:owner IS NULL OR LOWER(c.assignedManager) = LOWER(CAST(:owner AS string))) " +
            "ORDER BY c.id ASC")
    List<AmcSlaContractEntity> searchContracts(
            @Param("search") String search,
            @Param("serviceType") String serviceType,
            @Param("status") String status,
            @Param("renewalAlert") String renewalAlert,
            @Param("owner") String owner
    );

    long countByStatusIgnoreCase(String status);

    long countByRenewalAlertIgnoreCase(String renewalAlert);

    @Query("SELECT COALESCE(SUM(c.contractValue), 0) FROM AmcSlaContractEntity c WHERE LOWER(c.status) = 'active'")
    BigDecimal sumActiveContractValue();

    @Query("SELECT DISTINCT c.serviceType FROM AmcSlaContractEntity c WHERE c.serviceType IS NOT NULL ORDER BY c.serviceType ASC")
    List<String> findDistinctServiceTypes();

    @Query("SELECT DISTINCT c.status FROM AmcSlaContractEntity c WHERE c.status IS NOT NULL ORDER BY c.status ASC")
    List<String> findDistinctStatuses();

    @Query("SELECT DISTINCT c.renewalAlert FROM AmcSlaContractEntity c WHERE c.renewalAlert IS NOT NULL ORDER BY c.renewalAlert ASC")
    List<String> findDistinctRenewalAlerts();

    @Query("SELECT DISTINCT c.assignedManager FROM AmcSlaContractEntity c WHERE c.assignedManager IS NOT NULL AND TRIM(c.assignedManager) <> '' ORDER BY c.assignedManager ASC")
    List<String> findDistinctAssignedManagers();
}

