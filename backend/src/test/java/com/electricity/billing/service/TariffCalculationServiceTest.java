package com.electricity.billing.service;

import com.electricity.billing.entity.TariffConfiguration;
import com.electricity.billing.entity.enums.ConnectionType;
import com.electricity.billing.repository.TariffConfigurationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TariffCalculationServiceTest {

    @Mock
    private TariffConfigurationRepository tariffRepository;

    private TariffCalculationService tariffService;

    @BeforeEach
    void setUp() {
        tariffService = new TariffCalculationService(tariffRepository);
    }

    private TariffConfiguration createMockTariff() {
        TariffConfiguration config = new TariffConfiguration();
        config.setConnectionType(ConnectionType.RESIDENTIAL);
        config.setSlab1Limit(new BigDecimal("100.00"));
        config.setSlab1Rate(new BigDecimal("3.00"));
        config.setSlab2Limit(new BigDecimal("200.00"));
        config.setSlab2Rate(new BigDecimal("5.00"));
        config.setSlab3Rate(new BigDecimal("7.00"));
        config.setFixedCharge(BigDecimal.ZERO);
        config.setTaxPercentage(BigDecimal.ZERO);
        config.setSubsidyAmount(BigDecimal.ZERO);
        config.setLateFeePercentage(BigDecimal.ZERO);
        config.setIsActive(true);
        return config;
    }

    @Test
    @DisplayName("Should return 0 energy charges for 0 units consumed")
    void testZeroUnitsConsumption() {
        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(createMockTariff()));

        TariffCalculationService.CalculationResult result =
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, BigDecimal.ZERO, false);

        assertEquals(new BigDecimal("0.00"), result.getEnergyCharges());
        assertEquals(new BigDecimal("0.00"), result.getTotalAmount());
    }

    @Test
    @DisplayName("Should correctly calculate within Slab 1 (e.g. 50 units @ ₹3 = ₹150)")
    void testWithinSlab1() {
        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(createMockTariff()));

        TariffCalculationService.CalculationResult result =
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, new BigDecimal("50.00"), false);

        assertEquals(new BigDecimal("150.00"), result.getEnergyCharges());
    }

    @Test
    @DisplayName("Should correctly calculate exactly at Slab 1 boundary (100 units @ ₹3 = ₹300)")
    void testSlab1Boundary() {
        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(createMockTariff()));

        TariffCalculationService.CalculationResult result =
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, new BigDecimal("100.00"), false);

        assertEquals(new BigDecimal("300.00"), result.getEnergyCharges());
    }

    @Test
    @DisplayName("Should correctly calculate across Slab 1 and Slab 2 (150 units = 100*3 + 50*5 = ₹550)")
    void testAcrossSlab1AndSlab2() {
        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(createMockTariff()));

        TariffCalculationService.CalculationResult result =
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, new BigDecimal("150.00"), false);

        // 100 * 3 = 300, 50 * 5 = 250 -> Total = 550.00
        assertEquals(new BigDecimal("550.00"), result.getEnergyCharges());
    }

    @Test
    @DisplayName("Should correctly calculate exactly at Slab 2 boundary (200 units = 100*3 + 100*5 = ₹800)")
    void testSlab2Boundary() {
        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(createMockTariff()));

        TariffCalculationService.CalculationResult result =
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, new BigDecimal("200.00"), false);

        assertEquals(new BigDecimal("800.00"), result.getEnergyCharges());
    }

    @Test
    @DisplayName("Requirement Test: 250 units should yield ₹1,150 energy charges (100*3 + 100*5 + 50*7 = ₹1,150)")
    void testRequirement250UnitsCalculatesTo1150() {
        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(createMockTariff()));

        TariffCalculationService.CalculationResult result =
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, new BigDecimal("250.00"), false);

        // 100*3 + 100*5 + 50*7 = 300 + 500 + 350 = 1150.00
        assertEquals(new BigDecimal("1150.00"), result.getEnergyCharges());
        assertEquals(new BigDecimal("1150.00"), result.getTotalAmount());
    }

    @Test
    @DisplayName("Should include fixed charge and taxes when configured")
    void testBillWithFixedChargeAndTax() {
        TariffConfiguration config = createMockTariff();
        config.setFixedCharge(new BigDecimal("50.00"));
        config.setTaxPercentage(new BigDecimal("5.00")); // 5%

        when(tariffRepository.findByConnectionTypeAndIsActiveTrue(ConnectionType.RESIDENTIAL))
                .thenReturn(Optional.of(config));

        TariffCalculationService.CalculationResult result =
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, new BigDecimal("250.00"), false);

        // Energy = 1150.00, Fixed = 50.00 -> Base = 1200.00
        // Tax 5% of 1200.00 = 60.00 -> Total = 1260.00
        assertEquals(new BigDecimal("1150.00"), result.getEnergyCharges());
        assertEquals(new BigDecimal("50.00"), result.getFixedCharges());
        assertEquals(new BigDecimal("60.00"), result.getTaxAmount());
        assertEquals(new BigDecimal("1260.00"), result.getTotalAmount());
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when units are negative")
    void testNegativeUnitsThrowsException() {
        assertThrows(IllegalArgumentException.class, () ->
                tariffService.calculateBill(ConnectionType.RESIDENTIAL, new BigDecimal("-10.00"), false));
    }
}
