package com.company.project.notification.repository;

import com.company.project.notification.entity.PortalNotificationEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PortalNotificationRepository extends JpaRepository<PortalNotificationEntity, Long> {

    List<PortalNotificationEntity> findAllByOrderByCreatedAtDesc(Pageable pageable);

    long countByIsReadFalse();

    @Modifying
    @Query("UPDATE PortalNotificationEntity n SET n.isRead = true, n.updatedAt = CURRENT_TIMESTAMP WHERE n.isRead = false")
    int markAllAsRead();
}

