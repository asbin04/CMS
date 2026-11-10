package com.company.project.collections.repository;

import com.company.project.collections.entity.CollectionPaymentCounterEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollectionPaymentCounterRepository extends JpaRepository<CollectionPaymentCounterEntity, CollectionPaymentCounterEntity.CounterId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CollectionPaymentCounterEntity c WHERE c.prefix = :prefix AND c.year = :year")
    Optional<CollectionPaymentCounterEntity> findByPrefixAndYearWithLock(@Param("prefix") String prefix, @Param("year") Integer year);
}

