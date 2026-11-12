package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findAllByOrderByOrderIndexAscIdAsc();

    Optional<Contract> findByContractId(String contractId);

    boolean existsByContractId(String contractId);

    long countByStatusIgnoreCase(String status);

    @Query("SELECT COALESCE(SUM(c.contractValue), 0) FROM Contract c")
    BigDecimal sumTotalContractValue();

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.createdAt < :cutoff")
    long countBefore(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT COUNT(c) FROM Contract c WHERE LOWER(c.status) = LOWER(:status) AND c.createdAt < :cutoff")
    long countByStatusBefore(@Param("status") String status, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT COALESCE(SUM(c.contractValue), 0) FROM Contract c WHERE c.createdAt < :cutoff")
    BigDecimal sumTotalContractValueBefore(@Param("cutoff") LocalDateTime cutoff);
}

