package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.Opportunity;
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
public interface OpportunityRepository extends JpaRepository<Opportunity, Long> {

    Optional<Opportunity> findByOpportunityId(String opportunityId);

    List<Opportunity> findAllByOrderByOrderIndexAscCreatedAtAsc();

    @Query("SELECT o FROM Opportunity o WHERE " +
           "(CAST(:stage AS string) IS NULL OR LOWER(o.stage) = LOWER(CAST(:stage AS string))) AND " +
           "(CAST(:status AS string) IS NULL OR LOWER(o.status) = LOWER(CAST(:status AS string))) AND " +
           "(CAST(:ownerId AS string) IS NULL OR LOWER(o.ownerId) = LOWER(CAST(:ownerId AS string))) AND " +
           "(CAST(:clientId AS string) IS NULL OR LOWER(o.clientId) = LOWER(CAST(:clientId AS string))) AND " +
           "(CAST(:serviceId AS string) IS NULL OR LOWER(o.serviceId) = LOWER(CAST(:serviceId AS string))) AND " +
           "(CAST(:search AS string) IS NULL OR " +
           "LOWER(o.opportunityId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(o.leadId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(o.clientId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(o.opportunityName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(o.ownerId) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "ORDER BY o.orderIndex ASC, o.createdAt ASC")
    List<Opportunity> searchOpportunities(
            @Param("stage") String stage,
            @Param("status") String status,
            @Param("ownerId") String ownerId,
            @Param("clientId") String clientId,
            @Param("serviceId") String serviceId,
            @Param("search") String search);

    long countByStatusIgnoreCase(String status);

    @Query("SELECT COALESCE(SUM(o.weightedPipeline), 0) FROM Opportunity o")
    BigDecimal sumWeightedPipeline();

    // Sales Dashboard Aggregations
    @Query("SELECT COUNT(o) FROM Opportunity o WHERE o.createdAt >= :start AND o.createdAt < :end")
    long countOpportunitiesInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COUNT(o) FROM Opportunity o WHERE o.createdAt >= :start AND o.createdAt < :end AND LOWER(o.status) IN ('open', 'in progress') AND LOWER(o.stage) NOT IN ('closed won', 'closed lost')")
    long countOpenOpportunitiesInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.estimatedValue), 0) FROM Opportunity o WHERE o.createdAt >= :start AND o.createdAt < :end AND LOWER(o.status) IN ('open', 'in progress') AND LOWER(o.stage) NOT IN ('closed won', 'closed lost')")
    BigDecimal sumPipelineValueInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.estimatedValue * (CAST(o.probability AS double) / 100.0)), 0) FROM Opportunity o WHERE o.createdAt >= :start AND o.createdAt < :end AND LOWER(o.status) IN ('open', 'in progress') AND LOWER(o.stage) NOT IN ('closed won', 'closed lost')")
    BigDecimal sumWeightedPipelineInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.estimatedValue), 0) FROM Opportunity o WHERE o.createdAt >= :start AND o.createdAt < :end AND (LOWER(o.stage) IN ('closed won', 'won') OR LOWER(o.status) IN ('closed won', 'won'))")
    BigDecimal sumWonOpportunityValueInPeriod(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

    // Relationship-Based Funnel: Count distinct opportunities linked to leads in cohort
    @Query("SELECT COUNT(DISTINCT o.opportunityId) FROM Opportunity o WHERE o.leadId IN (SELECT l.id FROM com.company.project.sales.entity.LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end)")
    long countDistinctLinkedOpportunitiesByLeadCohort(@Param("start") LocalDate start, @Param("end") LocalDate end);

    // Relationship-Based Funnel: Count distinct cohort opportunities that have at least one linked proposal
    @Query("SELECT COUNT(DISTINCT o.opportunityId) FROM Opportunity o WHERE o.leadId IN (SELECT l.id FROM com.company.project.sales.entity.LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end) AND EXISTS (SELECT 1 FROM com.company.project.proposals.entity.ProposalEntity p WHERE p.opportunityId = o.opportunityId)")
    long countDistinctOpportunitiesWithLinkedProposals(@Param("start") LocalDate start, @Param("end") LocalDate end);
}
