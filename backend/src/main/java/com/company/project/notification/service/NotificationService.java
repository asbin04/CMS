package com.company.project.notification.service;

import com.company.project.notification.dto.NotificationSummaryResponse;
import com.company.project.notification.entity.PortalNotificationEntity;

public interface NotificationService {
    NotificationSummaryResponse getSummary(int limit);
    PortalNotificationEntity createNotification(String title, String detail, String type, String link);
    boolean markAsRead(Long id);
    int markAllAsRead();
}

