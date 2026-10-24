package com.electricity.billing.service;

import com.electricity.billing.dto.MeterReadingRequestDTO;
import com.electricity.billing.dto.MeterReadingResponseDTO;
import com.electricity.billing.entity.Customer;
import com.electricity.billing.entity.MeterReading;
import com.electricity.billing.entity.enums.CustomerStatus;
import com.electricity.billing.exception.DuplicateResourceException;
import com.electricity.billing.exception.InvalidOperationException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.CustomerRepository;
import com.electricity.billing.repository.MeterReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MeterReadingService {

    private final MeterReadingRepository meterReadingRepository;
    private final CustomerRepository customerRepository;

    public MeterReadingService(MeterReadingRepository meterReadingRepository, CustomerRepository customerRepository) {
        this.meterReadingRepository = meterReadingRepository;
        this.customerRepository = customerRepository;
    }

    public List<MeterReadingResponseDTO> getAllReadings() {
        return meterReadingRepository.findAllByOrderByBillingYearDescBillingMonthDescReadingDateDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<MeterReadingResponseDTO> getReadingsByCustomerId(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }
        return meterReadingRepository.findByCustomerIdOrderByBillingYearDescBillingMonthDesc(customerId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public MeterReadingResponseDTO getReadingById(Long id) {
        MeterReading reading = meterReadingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Meter reading not found with ID: " + id));
        return toDTO(reading);
    }

    /**
     * Gets the suggested previous reading for a customer based on the last recorded meter reading.
     */
    public BigDecimal getLatestReadingForCustomer(Long customerId) {
        return meterReadingRepository.findTopByCustomerIdOrderByBillingYearDescBillingMonthDesc(customerId)
                .map(MeterReading::getCurrentReading)
                .orElse(BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP));
    }

    @Transactional
    public MeterReadingResponseDTO recordReading(MeterReadingRequestDTO dto) {
        Customer customer = customerRepository.findById(dto.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + dto.getCustomerId()));

        if (customer.getStatus() == CustomerStatus.INACTIVE) {
            throw new InvalidOperationException("Cannot record meter reading for an inactive customer");
        }

        // Check for duplicate reading for this billing cycle
        if (meterReadingRepository.existsByCustomerIdAndBillingMonthAndBillingYear(
                dto.getCustomerId(), dto.getBillingMonth(), dto.getBillingYear())) {
            throw new DuplicateResourceException(String.format(
                    "Meter reading already exists for customer %s in period %d/%d",
                    customer.getConsumerNumber(), dto.getBillingMonth(), dto.getBillingYear()));
        }

        // Determine previous reading
        BigDecimal previousReading = dto.getPreviousReading();
        if (previousReading == null) {
            Optional<MeterReading> lastReading = meterReadingRepository
                    .findTopByCustomerIdOrderByBillingYearDescBillingMonthDesc(dto.getCustomerId());
            previousReading = lastReading.map(MeterReading::getCurrentReading).orElse(BigDecimal.ZERO);
        }

        if (previousReading.compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Previous reading cannot be negative");
        }

        if (dto.getCurrentReading() == null || dto.getCurrentReading().compareTo(BigDecimal.ZERO) < 0) {
            throw new InvalidOperationException("Current reading cannot be negative");
        }

        if (dto.getCurrentReading().compareTo(previousReading) < 0) {
            throw new InvalidOperationException(String.format(
                    "Current reading (%.2f) cannot be lower than previous reading (%.2f)",
                    dto.getCurrentReading(), previousReading));
        }

        BigDecimal unitsConsumed = dto.getCurrentReading().subtract(previousReading).setScale(2, RoundingMode.HALF_UP);

        MeterReading reading = new MeterReading();
        reading.setCustomer(customer);
        reading.setBillingMonth(dto.getBillingMonth());
        reading.setBillingYear(dto.getBillingYear());
        reading.setReadingDate(dto.getReadingDate() != null ? dto.getReadingDate() : LocalDate.now());
        reading.setPreviousReading(previousReading.setScale(2, RoundingMode.HALF_UP));
        reading.setCurrentReading(dto.getCurrentReading().setScale(2, RoundingMode.HALF_UP));
        reading.setUnitsConsumed(unitsConsumed);
        reading.setRemarks(dto.getRemarks());

        MeterReading saved = meterReadingRepository.save(reading);
        return toDTO(saved);
    }

    public MeterReadingResponseDTO toDTO(MeterReading r) {
        return new MeterReadingResponseDTO(
                r.getId(),
                r.getCustomer().getId(),
                r.getCustomer().getFullName(),
                r.getCustomer().getConsumerNumber(),
                r.getBillingMonth(),
                r.getBillingYear(),
                r.getReadingDate(),
                r.getPreviousReading(),
                r.getCurrentReading(),
                r.getUnitsConsumed(),
                r.getRemarks(),
                r.getCreatedAt()
        );
    }
}
