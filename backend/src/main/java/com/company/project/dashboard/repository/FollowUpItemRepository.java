package com.company.project.dashboard.repository;

import com.company.project.dashboard.entity.FollowUpItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FollowUpItemRepository extends JpaRepository<FollowUpItem, Long> {

    List<FollowUpItem> findAllByOrderByOrderIndexAscIdAsc();

    List<FollowUpItem> findByPriorityIgnoreCaseOrderByOrderIndexAscIdAsc(String priority);

    @Query("SELECT f FROM FollowUpItem f WHERE " +
           "LOWER(f.moduleName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.moduleSub) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.keyInfoTitle) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.keyInfoSub) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.health) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "ORDER BY f.orderIndex ASC, f.id ASC")
    List<FollowUpItem> searchByKeyword(@Param("search") String search);

    @Query("SELECT f FROM FollowUpItem f WHERE " +
           "LOWER(f.priority) = LOWER(:priority) AND (" +
           "LOWER(f.moduleName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.moduleSub) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.keyInfoTitle) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.keyInfoSub) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(f.health) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY f.orderIndex ASC, f.id ASC")
    List<FollowUpItem> searchByPriorityAndKeyword(@Param("priority") String priority, @Param("search") String search);

    @Query("SELECT f FROM FollowUpItem f WHERE " +
           "(CAST(:priority AS string) IS NULL OR LOWER(f.priority) = LOWER(CAST(:priority AS string))) AND " +
           "(CAST(:search AS string) IS NULL OR " +
           "LOWER(f.moduleName) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(f.moduleSub) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(f.keyInfoTitle) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(f.keyInfoSub) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR " +
           "LOWER(f.health) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) " +
           "ORDER BY f.orderIndex ASC, f.id ASC")
    List<FollowUpItem> searchItems(@Param("priority") String priority, @Param("search") String search);

    @Query("SELECT COUNT(f) FROM FollowUpItem f WHERE LOWER(f.priority) = LOWER(:priority) AND f.isDone = :isDone")
    long countByPriorityAndIsDone(@Param("priority") String priority, @Param("isDone") Boolean isDone);

    @Query("SELECT COUNT(f) FROM FollowUpItem f WHERE LOWER(f.priority) = LOWER(:priority)")
    long countByPriority(@Param("priority") String priority);

    long countByHealthIgnoreCaseAndIsDoneFalse(String health);

    long countByIsDoneTrue();

    @Query("SELECT COALESCE(SUM(f.count), 0) FROM FollowUpItem f WHERE LOWER(f.priority) = LOWER(:priority) AND (f.isDone = false OR f.isDone IS NULL)")
    long sumCountByPriorityAndIsDoneFalse(@Param("priority") String priority);
}
