package com.company.project.proposals.repository;

import com.company.project.proposals.entity.ProposalEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

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
}
