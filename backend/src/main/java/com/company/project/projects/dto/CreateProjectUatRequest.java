package com.company.project.projects.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateProjectUatRequest {

    private String id;

    @NotBlank(message = "Project ID is required")
    private String projectId;

    @NotBlank(message = "Requirement ID is required")
    private String requirementId;

    @NotNull(message = "Test date is required")
    private LocalDate testDate;

    @NotBlank(message = "Test case code is required")
    private String testCase;

    @NotBlank(message = "Expected result is required")
    private String expectedResult;

    @NotBlank(message = "Actual result is required")
    private String actualResult;

    @NotBlank(message = "Tester name is required")
    private String testerName;

    private String testerInitials;
    private String testerColor;

    private String status;
    private String defectId;
    private String clientApproval;
    private LocalDate approvalDate;
    private String comments;
}

