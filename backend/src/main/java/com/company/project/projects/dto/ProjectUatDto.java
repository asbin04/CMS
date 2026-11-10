package com.company.project.projects.dto;

import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProjectUatDto {
    private String id;
    private String projectId;
    private String requirementId;
    private LocalDate testDate;
    private String testCase;
    private String expectedResult;
    private String actualResult;
    private String testerName;
    private String testerInitials;
    private String testerColor;
    private String status;
    private String defectId;
    private String clientApproval;
    private LocalDate approvalDate;
    private String comments;
}

