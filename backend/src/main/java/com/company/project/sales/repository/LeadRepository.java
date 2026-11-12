package com.company.project.sales.repository;

import com.company.project.sales.entity.LeadEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface LeadRepository extends JpaRepository<LeadEntity, String>, JpaSpecificationExecutor<LeadEntity> {

    List<LeadEntity> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(l) FROM LeadEntity l WHERE l.leadDate >= :start AND l.leadDate <= :end")
    long countLeadsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(l) FROM LeadEntity l WHERE l.leadDate < :date")
    long countLeadsBefore(@Param("date") LocalDate date);

    @Query("SELECT COUNT(l) FROM LeadEntity l WHERE l.nextFollowUp IS NOT NULL AND l.nextFollowUp <= :date AND lower(l.stage) NOT IN ('lost', 'closed lost', 'won', 'converted')")
    long countFollowUpsDue(@Param("date") LocalDate date);

    @Query("SELECT COUNT(l) FROM LeadEntity l WHERE l.nextFollowUp IS NOT NULL AND l.nextFollowUp >= :start AND l.nextFollowUp <= :end AND lower(l.stage) NOT IN ('lost', 'closed lost', 'won', 'converted')")
    long countFollowUpsDueBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT COUNT(l) FROM LeadEntity l WHERE lower(l.stage) IN ('won', 'closed won', 'converted')")
    long countConvertedLeads();

    @Query("SELECT COUNT(l) FROM LeadEntity l WHERE lower(l.stage) IN ('won', 'closed won', 'converted') AND l.leadDate >= :start AND l.leadDate <= :end")
    long countConvertedLeadsBetween(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query(value = "SELECT COALESCE(MAX(NULLIF(regexp_replace(id, '^L-[0-9]{4}-', ''), '')), '0')::bigint FROM leads WHERE id LIKE :prefixPattern", nativeQuery = true)
    Long findMaxSequenceByPrefix(@Param("prefixPattern") String prefixPattern);
}
