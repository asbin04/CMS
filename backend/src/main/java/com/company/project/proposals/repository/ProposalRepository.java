package com.company.project.proposals.repository;

import com.company.project.proposals.entity.ProposalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface ProposalRepository extends JpaRepository<ProposalEntity, String>, JpaSpecificationExecutor<ProposalEntity> {

    @Query("SELECT DISTINCT p.ownerId FROM ProposalEntity p WHERE p.ownerId IS NOT NULL ORDER BY p.ownerId")
    List<String> findDistinctOwnerIds();

    @Query("SELECT DISTINCT p.clientId FROM ProposalEntity p WHERE p.clientId IS NOT NULL ORDER BY p.clientId")
    List<String> findDistinctClientIds();

    @Query("SELECT DISTINCT p.opportunityId FROM ProposalEntity p WHERE p.opportunityId IS NOT NULL ORDER BY p.opportunityId")
    List<String> findDistinctOpportunityIds();

    @Query("SELECT DISTINCT p.serviceId FROM ProposalEntity p WHERE p.serviceId IS NOT NULL ORDER BY p.serviceId")
    List<String> findDistinctServiceIds();

    long countByStatus(String status);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM ProposalEntity p")
    BigDecimal sumTotalAmount();

    @Query("SELECT COUNT(p) FROM ProposalEntity p WHERE p.createdAt < :cutoff")
    long countBefore(@Param("cutoff") OffsetDateTime cutoff);

    @Query("SELECT COUNT(p) FROM ProposalEntity p WHERE p.status = :status AND p.createdAt < :cutoff")
    long countByStatusBefore(@Param("status") String status, @Param("cutoff") OffsetDateTime cutoff);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM ProposalEntity p WHERE p.createdAt < :cutoff")
    BigDecimal sumTotalAmountBefore(@Param("cutoff") OffsetDateTime cutoff);

    // Sales Dashboard Aggregations
    @Query("SELECT COUNT(p) FROM ProposalEntity p WHERE p.proposalDate >= :start AND p.proposalDate <= :end")
    long countProposalsInPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM ProposalEntity p WHERE p.proposalDate >= :start AND p.proposalDate <= :end")
    BigDecimal sumTotalProposalValueInPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM ProposalEntity p WHERE p.proposalDate >= :start AND p.proposalDate <= :end AND LOWER(p.status) = 'approved'")
    BigDecimal sumAcceptedProposalValueInPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(p) FROM ProposalEntity p WHERE p.proposalDate >= :start AND p.proposalDate <= :end AND LOWER(p.status) = 'approved'")
    long countAcceptedProposalsInPeriod(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // Relationship-Based Funnel: Count distinct proposals linked to opportunities of the lead cohort
    @Query("SELECT COUNT(DISTINCT p.id) FROM ProposalEntity p WHERE p.opportunityId IN (SELECT o.opportunityId FROM com.company.project.dashboard.entity.Opportunity o WHERE o.leadId IN (SELECT l.id FROM com.company.project.sales.entity.LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end))")
    long countDistinctLinkedProposalsByLeadCohort(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // KPI Cards: Sum of totalAmount for proposals linked to opportunities of the lead cohort
    @Query("SELECT COALESCE(SUM(p.totalAmount), 0) FROM ProposalEntity p WHERE p.opportunityId IN (SELECT o.opportunityId FROM com.company.project.dashboard.entity.Opportunity o WHERE o.leadId IN (SELECT l.id FROM com.company.project.sales.entity.LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end))")
    BigDecimal sumLinkedProposalsValueByLeadCohort(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // Relationship-Based Funnel: Count distinct cohort proposals that have at least one linked contract
    @Query("SELECT COUNT(DISTINCT p.id) FROM ProposalEntity p WHERE p.opportunityId IN (SELECT o.opportunityId FROM com.company.project.dashboard.entity.Opportunity o WHERE o.leadId IN (SELECT l.id FROM com.company.project.sales.entity.LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end)) AND EXISTS (SELECT 1 FROM com.company.project.dashboard.entity.Contract c WHERE c.proposalId = p.id)")
    long countDistinctProposalsWithLinkedContracts(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
