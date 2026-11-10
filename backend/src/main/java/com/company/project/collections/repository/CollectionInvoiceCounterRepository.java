package com.company.project.collections.repository;

import com.company.project.collections.entity.CollectionInvoiceCounterEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollectionInvoiceCounterRepository extends JpaRepository<CollectionInvoiceCounterEntity, CollectionInvoiceCounterEntity.CounterId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CollectionInvoiceCounterEntity c WHERE c.prefix = :prefix AND c.year = :year")
    Optional<CollectionInvoiceCounterEntity> findByPrefixAndYearWithLock(@Param("prefix") String prefix, @Param("year") Integer year);
}

