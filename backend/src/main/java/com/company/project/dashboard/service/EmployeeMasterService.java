package com.company.project.dashboard.service;

import com.company.project.dashboard.dto.CreateEmployeeRequest;
import com.company.project.dashboard.dto.EmployeeMasterDto;
import com.company.project.dashboard.dto.EmployeeMasterSummaryDto;

import java.util.List;

public interface EmployeeMasterService {

    List<EmployeeMasterDto> getAllEmployees(
            String department,
            String designation,
            String employmentType,
            String status,
            String location,
            String reportingManager,
            String search
    );

    EmployeeMasterSummaryDto getSummary();

    EmployeeMasterDto getById(Long id);

    EmployeeMasterDto createEmployee(CreateEmployeeRequest request);

    List<EmployeeMasterDto> createEmployees(List<CreateEmployeeRequest> requests);

    EmployeeMasterDto updateEmployee(Long id, CreateEmployeeRequest request);

    void deleteEmployee(Long id);
}

