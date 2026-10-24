package com.electricity.billing.service;

import com.electricity.billing.dto.TariffDTO;
import com.electricity.billing.entity.TariffConfiguration;
import com.electricity.billing.entity.enums.ConnectionType;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.TariffConfigurationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TariffService {

    private final TariffConfigurationRepository tariffRepository;

    public TariffService(TariffConfigurationRepository tariffRepository) {
        this.tariffRepository = tariffRepository;
    }

    public List<TariffDTO> getAllTariffs() {
        return tariffRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public TariffDTO getTariffByConnectionType(ConnectionType connectionType) {
        TariffConfiguration tariff = tariffRepository.findByConnectionTypeAndIsActiveTrue(connectionType)
                .orElseThrow(() -> new ResourceNotFoundException("No active tariff configured for connection type: " + connectionType));
        return toDTO(tariff);
    }

    @Transactional
    public TariffDTO updateTariff(Long id, TariffDTO dto) {
        TariffConfiguration tariff = tariffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Tariff configuration not found with ID: " + id));

        tariff.setSlab1Limit(dto.getSlab1Limit());
        tariff.setSlab1Rate(dto.getSlab1Rate());
        tariff.setSlab2Limit(dto.getSlab2Limit());
        tariff.setSlab2Rate(dto.getSlab2Rate());
        tariff.setSlab3Rate(dto.getSlab3Rate());
        tariff.setFixedCharge(dto.getFixedCharge());
        tariff.setTaxPercentage(dto.getTaxPercentage());
        tariff.setSubsidyAmount(dto.getSubsidyAmount());
        tariff.setLateFeePercentage(dto.getLateFeePercentage());
        if (dto.getIsActive() != null) {
            tariff.setIsActive(dto.getIsActive());
        }

        TariffConfiguration saved = tariffRepository.save(tariff);
        return toDTO(saved);
    }

    public TariffDTO toDTO(TariffConfiguration t) {
        TariffDTO dto = new TariffDTO();
        dto.setId(t.getId());
        dto.setConnectionType(t.getConnectionType());
        dto.setSlab1Limit(t.getSlab1Limit());
        dto.setSlab1Rate(t.getSlab1Rate());
        dto.setSlab2Limit(t.getSlab2Limit());
        dto.setSlab2Rate(t.getSlab2Rate());
        dto.setSlab3Rate(t.getSlab3Rate());
        dto.setFixedCharge(t.getFixedCharge());
        dto.setTaxPercentage(t.getTaxPercentage());
        dto.setSubsidyAmount(t.getSubsidyAmount());
        dto.setLateFeePercentage(t.getLateFeePercentage());
        dto.setIsActive(t.getIsActive());
        return dto;
    }
}
