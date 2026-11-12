package com.company.project.collections.repository;

import com.company.project.collections.entity.CollectionCommunicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CollectionCommunicationRepository extends JpaRepository<CollectionCommunicationEntity, Long> {
    List<CollectionCommunicationEntity> findByInvoiceIdOrderByCreatedAtDesc(String invoiceId);
}

