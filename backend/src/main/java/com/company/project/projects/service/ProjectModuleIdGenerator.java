package com.company.project.projects.service;

import java.time.LocalDate;

/**
 * Interface defining atomic sequence and ID allocation contracts for the Project module.
 */
public interface ProjectModuleIdGenerator {

    Long allocateNextSequence(String entityType, String periodKey);

    Long getCurrentSequence(String entityType, String periodKey);

    String generateTimesheetId(LocalDate date);

    String generateTimesheetId();

    String generateRequirementId(LocalDate date);

    String generateRequirementId();

    String generateProjectId();

    String generateTaskId();

    String generateDevelopmentId(LocalDate date);

    String generateDevelopmentId();

    String previewNextDevelopmentId(LocalDate date);

    String previewNextDevelopmentId();
}

