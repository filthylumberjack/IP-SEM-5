package com.electricity.billing.service;

import com.electricity.billing.dto.BillGenerationRequestDTO;
import com.electricity.billing.dto.BillResponseDTO;
import com.electricity.billing.entity.Bill;
import com.electricity.billing.entity.Customer;
import com.electricity.billing.entity.MeterReading;
import com.electricity.billing.entity.TariffConfiguration;
import com.electricity.billing.entity.enums.BillStatus;
import com.electricity.billing.entity.enums.ConnectionType;
import com.electricity.billing.entity.enums.CustomerStatus;
import com.electricity.billing.exception.DuplicateResourceException;
import com.electricity.billing.exception.InvalidOperationException;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.CustomerRepository;
import com.electricity.billing.repository.MeterReadingRepository;
import com.electricity.billing.repository.TariffConfigurationRepository;
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
class BillServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private MeterReadingRepository meterReadingRepository;

    @Mock
    private TariffConfigurationRepository tariffRepository;

    private TariffCalculationService tariffCalculationService;
    private BillService billService;

    private Customer testCustomer;
    private MeterReading testReading;

    @BeforeEach
    void setUp() {
        tariffCalculationService = new TariffCalculationService(tariffRepository);
        billService = new BillService(billRepository, customerRepository, meterReadingRepository, tariffCalculationService);

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setConsumerNumber("CON-1001");
        testCustomer.setFullName("Rahul Sharma");
        testCustomer.setConnectionType(ConnectionType.RESIDENTIAL);
        testCustomer.setStatus(CustomerStatus.ACTIVE);

        testReading = new MeterReading();
        testReading.setId(10L);
        testReading.setCustomer(testCustomer);
        testReading.setBillingMonth(9);
        testReading.setBillingYear(2026);
        testReading.setPreviousReading(new BigDecimal("1000.00"));
        testReading.setCurrentReading(new BigDecimal("1250.00"));
        testReading.setUnitsConsumed(new BigDecimal("250.00"));
    }

    @Test
    @DisplayName("Should successfully generate bill using progressive tariff calculation (250 units = ₹1,150 energy charge)")
    void testGenerateBillSuccess() {
        TariffConfiguration tariffConfig = new TariffConfiguration();
        tariffConfig.setConnectionType(ConnectionType.RESIDENTIAL);
        tariffConfig.setSlab1Limit(new BigDecimal("100.00"));
        tariffConfig.setSlab1Rate(new BigDecimal("3.00"));
        tariffConfig.setSlab2Limit(new BigDecimal("200.00"));
        tariffConfig.setSlab2Rate(new BigDecimal("5.00"));
        tariffConfig.setSlab3Rate(new BigDecimal("7.00"));
        tariffConfig.setFixedCharge(new BigDecimal("50.00"));
        tariffConfig.setTaxPercentage(new BigDecimal("5.00"));
        tariffConfig.setSubsidyAmount(BigDecimal.ZERO);
        tariffConfig.setLateFeePercentage(BigDecimal.ZERO);
        tariffConfig.setIsActive(true);

        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(tariffConfig));
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(billRepository.existsByCustomerIdAndBillingMonthAndBillingYear(1L, 9, 2026)).thenReturn(false);
        when(meterReadingRepository.findByCustomerIdAndBillingMonthAndBillingYear(1L, 9, 2026)).thenReturn(Optional.of(testReading));

        when(billRepository.save(any(Bill.class))).thenAnswer(i -> {
            Bill b = i.getArgument(0);
            b.setId(200L);
            return b;
        });

        // Use a future due date so status is PENDING
        LocalDate billDate = LocalDate.now();
        LocalDate dueDate = billDate.plusDays(15);
        BillGenerationRequestDTO request = new BillGenerationRequestDTO(1L, 9, 2026, billDate, dueDate);
        BillResponseDTO response = billService.generateBill(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("250.00"), response.getUnitsConsumed());
        // Progressive energy charges: 100*3 + 100*5 + 50*7 = 1150.00
        assertEquals(new BigDecimal("1150.00"), response.getEnergyCharges());
        assertEquals(new BigDecimal("50.00"), response.getFixedCharges());
        assertEquals(new BigDecimal("60.00"), response.getTaxAmount()); // 5% of 1200
        assertEquals(new BigDecimal("1260.00"), response.getTotalAmount());
        assertEquals(new BigDecimal("1260.00"), response.getOutstandingBalance());
        assertEquals(BillStatus.PENDING, response.getStatus());

        verify(billRepository).save(any(Bill.class));
    }

    @Test
    @DisplayName("Should reject duplicate bill generation for same customer and period")
    void testRejectDuplicateBillGeneration() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(billRepository.existsByCustomerIdAndBillingMonthAndBillingYear(1L, 9, 2026)).thenReturn(true);

        BillGenerationRequestDTO request = new BillGenerationRequestDTO(1L, 9, 2026, LocalDate.now(), LocalDate.now().plusDays(15));

        assertThrows(DuplicateResourceException.class, () -> billService.generateBill(request));
        verify(billRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject bill generation when no meter reading exists for period")
    void testRejectBillWhenNoReadingFound() {
        when(customerRepository.findById(1L)).thenReturn(Optional.of(testCustomer));
        when(billRepository.existsByCustomerIdAndBillingMonthAndBillingYear(1L, 9, 2026)).thenReturn(false);
        when(meterReadingRepository.findByCustomerIdAndBillingMonthAndBillingYear(1L, 9, 2026)).thenReturn(Optional.empty());

        BillGenerationRequestDTO request = new BillGenerationRequestDTO(1L, 9, 2026, LocalDate.now(), LocalDate.now().plusDays(15));

        assertThrows(InvalidOperationException.class, () -> billService.generateBill(request));
    }
}
