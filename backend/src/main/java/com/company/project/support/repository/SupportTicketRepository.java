package com.company.project.support.repository;

import com.company.project.support.entity.SupportTicketEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SupportTicketRepository extends JpaRepository<SupportTicketEntity, Long>, JpaSpecificationExecutor<SupportTicketEntity> {

    Optional<SupportTicketEntity> findByTicketCode(String ticketCode);

    Optional<SupportTicketEntity> findTopByOrderByIdDesc();

    @Query("SELECT MAX(t.ticketCode) FROM SupportTicketEntity t WHERE t.ticketCode LIKE 'ST-2026-%'")
    Optional<String> findMaxTicketCode();

    long countByStatusIgnoreCase(String status);

    long countByStatusIgnoreCaseIn(List<String> statuses);

    long countBySlaStatusIgnoreCase(String slaStatus);

    @Query("SELECT DISTINCT t.ticketType FROM SupportTicketEntity t WHERE t.ticketType IS NOT NULL ORDER BY t.ticketType")
    List<String> findDistinctTicketTypes();

    @Query("SELECT DISTINCT t.priority FROM SupportTicketEntity t WHERE t.priority IS NOT NULL ORDER BY t.priority")
    List<String> findDistinctPriorities();

    @Query("SELECT DISTINCT t.status FROM SupportTicketEntity t WHERE t.status IS NOT NULL ORDER BY t.status")
    List<String> findDistinctStatuses();

    @Query("SELECT DISTINCT t.slaStatus FROM SupportTicketEntity t WHERE t.slaStatus IS NOT NULL ORDER BY t.slaStatus")
    List<String> findDistinctSlaStatuses();

    @Query("SELECT t FROM SupportTicketEntity t WHERE " +
           "(:ticketType IS NULL OR :ticketType = '' OR :ticketType = 'All' OR LOWER(t.ticketType) = LOWER(:ticketType)) AND " +
           "(:priority IS NULL OR :priority = '' OR :priority = 'All' OR LOWER(t.priority) = LOWER(:priority)) AND " +
           "(:status IS NULL OR :status = '' OR :status = 'All' OR LOWER(t.status) = LOWER(:status)) AND " +
           "(:slaStatus IS NULL OR :slaStatus = '' OR :slaStatus = 'All' OR LOWER(t.slaStatus) = LOWER(:slaStatus)) AND " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(t.ticketCode) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.clientId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.projectId) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(t.amcSlaId, '')) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.issueRequest) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(t.assignedTo) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(COALESCE(t.description, '')) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY t.openedDate DESC, t.ticketCode DESC")
    List<SupportTicketEntity> searchTickets(
            @Param("search") String search,
            @Param("ticketType") String ticketType,
            @Param("priority") String priority,
            @Param("status") String status,
            @Param("slaStatus") String slaStatus
    );
}
