package com.company.project.collections.repository;

import com.company.project.collections.entity.CollectionReversalCounterEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CollectionReversalCounterRepository extends JpaRepository<CollectionReversalCounterEntity, CollectionReversalCounterEntity.CounterId> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM CollectionReversalCounterEntity c WHERE c.prefix = :prefix AND c.year = :year")
    Optional<CollectionReversalCounterEntity> findByPrefixAndYearWithLock(@Param("prefix") String prefix, @Param("year") Integer year);
}

