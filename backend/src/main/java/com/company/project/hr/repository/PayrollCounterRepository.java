package com.company.project.hr.repository;

import com.company.project.hr.entity.PayrollCounterEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PayrollCounterRepository extends JpaRepository<PayrollCounterEntity, String> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM PayrollCounterEntity c WHERE c.prefix = :prefix")
    Optional<PayrollCounterEntity> findByPrefixWithLock(@Param("prefix") String prefix);
}

