package com.company.project.support.service;

import com.company.project.support.dto.*;

import java.util.List;

public interface AmcSlaContractService {

    List<AmcSlaContractDto> getAllContracts(String search, String serviceType, String status, String renewalAlert, String owner, String renewalWindow);
    List<AmcSlaContractDto> getAllContracts(String search, String serviceType, String status, String renewalAlert);

    AmcSlaKpiResponse getKpis();

    AmcSlaFilterOptionsResponse getFilterOptions();

    AmcSlaContractDto getContractById(Long id);

    AmcSlaContractDto getContractByCode(String code);

    AmcSlaContractDto createContract(CreateAmcSlaContractRequest request);

    AmcSlaContractDto updateContract(Long id, UpdateAmcSlaContractRequest request);

    void deleteContract(Long id);
}

