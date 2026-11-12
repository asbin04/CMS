package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

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
}
