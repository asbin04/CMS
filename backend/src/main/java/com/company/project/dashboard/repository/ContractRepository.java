package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
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

    // Sales Dashboard Aggregations
    @Query("SELECT COUNT(c) FROM Contract c WHERE c.createdAt >= :start AND c.createdAt < :end AND LOWER(c.status) = 'active'")
    long countActiveContractsInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(c.contractValue), 0) FROM Contract c WHERE c.createdAt >= :start AND c.createdAt < :end AND LOWER(c.status) = 'active'")
    BigDecimal sumActiveContractValueInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Relationship-Based Funnel: Count distinct contracts linked to proposals of the lead cohort
    @Query("SELECT COUNT(DISTINCT c.contractId) FROM Contract c WHERE c.proposalId IN (SELECT p.id FROM com.company.project.proposals.entity.ProposalEntity p WHERE p.opportunityId IN (SELECT o.opportunityId FROM com.company.project.dashboard.entity.Opportunity o WHERE o.leadId IN (SELECT l.id FROM com.company.project.sales.entity.LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end)))")
    long countDistinctLinkedContractsByLeadCohort(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // KPI Cards: Count distinct ACTIVE contracts linked to proposals of the lead cohort
    @Query("SELECT COUNT(DISTINCT c.contractId) FROM Contract c WHERE LOWER(c.status) = 'active' AND c.proposalId IN (SELECT p.id FROM com.company.project.proposals.entity.ProposalEntity p WHERE p.opportunityId IN (SELECT o.opportunityId FROM com.company.project.dashboard.entity.Opportunity o WHERE o.leadId IN (SELECT l.id FROM com.company.project.sales.entity.LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end)))")
    long countDistinctActiveLinkedContractsByLeadCohort(@Param("start") LocalDate start, @Param("end") LocalDate end);
}

