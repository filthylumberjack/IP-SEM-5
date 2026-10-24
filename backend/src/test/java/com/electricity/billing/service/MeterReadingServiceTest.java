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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MeterReadingServiceTest {

    @Mock
    private MeterReadingRepository meterReadingRepository;

    @Mock
    private CustomerRepository customerRepository;

    private MeterReadingService meterReadingService;

    private Customer activeCustomer;

    @BeforeEach
    void setUp() {
        meterReadingService = new MeterReadingService(meterReadingRepository, customerRepository);

        activeCustomer = new Customer();
        activeCustomer.setId(1L);
        activeCustomer.setConsumerNumber("CON-1001");
        activeCustomer.setFullName("Test Customer");
        activeCustomer.setStatus(CustomerStatus.ACTIVE);
    }

    @Test
    @DisplayName("Should successfully record meter reading and calculate units consumed")
    void testRecordReadingSuccess() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(activeCustomer));
        when(meterReadingRepository.existsByCustomerIdAndBillingMonthAndBillingYear(1L, 10, 2026)).thenReturn(false);
        when(meterReadingRepository.save(any(MeterReading.class))).thenAnswer(i -> {
            MeterReading r = i.getArgument(0);
            r.setId(50L);
            return r;
        });

        MeterReadingRequestDTO request = new MeterReadingRequestDTO(
                1L, 10, 2026, LocalDate.now(),
                new BigDecimal("1000.00"), new BigDecimal("1250.00"), "Regular"
        );

        MeterReadingResponseDTO response = meterReadingService.recordReading(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("1000.00"), response.getPreviousReading());
        assertEquals(new BigDecimal("1250.00"), response.getCurrentReading());
        assertEquals(new BigDecimal("250.00"), response.getUnitsConsumed());
    }

    @Test
    @DisplayName("Should reject meter reading where current reading is lower than previous reading")
    void testCurrentReadingLowerThanPreviousRejected() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(activeCustomer));
        when(meterReadingRepository.existsByCustomerIdAndBillingMonthAndBillingYear(1L, 10, 2026)).thenReturn(false);

        MeterReadingRequestDTO request = new MeterReadingRequestDTO(
                1L, 10, 2026, LocalDate.now(),
                new BigDecimal("1200.00"), new BigDecimal("1150.00"), "Invalid reading"
        );

        InvalidOperationException ex = assertThrows(InvalidOperationException.class, () ->
                meterReadingService.recordReading(request));

        assertTrue(ex.getMessage().contains("cannot be lower than previous reading"));
    }

    @Test
    @DisplayName("Should reject duplicate reading for same customer and billing period")
    void testDuplicateReadingRejected() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(activeCustomer));
        when(meterReadingRepository.existsByCustomerIdAndBillingMonthAndBillingYear(1L, 10, 2026)).thenReturn(true);

        MeterReadingRequestDTO request = new MeterReadingRequestDTO(
                1L, 10, 2026, LocalDate.now(),
                new BigDecimal("1000.00"), new BigDecimal("1200.00"), "Duplicate"
        );

        assertThrows(DuplicateResourceException.class, () -> meterReadingService.recordReading(request));
    }

    @Test
    @DisplayName("Should reject reading for inactive customer")
    void testInactiveCustomerReadingRejected() {
        activeCustomer.setStatus(CustomerStatus.INACTIVE);
        when(customerRepository.findById(1L)).thenReturn(Optional.of(activeCustomer));

        MeterReadingRequestDTO request = new MeterReadingRequestDTO(
                1L, 10, 2026, LocalDate.now(),
                new BigDecimal("100.00"), new BigDecimal("200.00"), "Inactive"
        );

        assertThrows(InvalidOperationException.class, () -> meterReadingService.recordReading(request));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException for missing customer ID")
    void testMissingCustomerId() {
        when(customerRepository.findById(999L)).thenReturn(Optional.empty());

        MeterReadingRequestDTO request = new MeterReadingRequestDTO(
                999L, 10, 2026, LocalDate.now(),
                new BigDecimal("100.00"), new BigDecimal("200.00"), "Missing"
        );

        assertThrows(ResourceNotFoundException.class, () -> meterReadingService.recordReading(request));
    }
}
