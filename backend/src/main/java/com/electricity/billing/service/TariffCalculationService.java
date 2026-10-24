package com.electricity.billing.service;

import com.electricity.billing.entity.TariffConfiguration;
import com.electricity.billing.entity.enums.ConnectionType;
import com.electricity.billing.repository.TariffConfigurationRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Service for calculating progressive tariff-based electricity charges.
 * Uses BigDecimal for precision and safe financial calculations.
 */
@Service
public class TariffCalculationService {

    private final TariffConfigurationRepository tariffRepository;

    // Default sample educational rates if not found in database:
    // Slab 1: 0 - 100 units @ ₹3.00
    // Slab 2: 101 - 200 units @ ₹5.00
    // Slab 3: Above 200 units @ ₹7.00
    public static final BigDecimal DEFAULT_SLAB_1_LIMIT = new BigDecimal("100.00");
    public static final BigDecimal DEFAULT_SLAB_1_RATE = new BigDecimal("3.00");
    public static final BigDecimal DEFAULT_SLAB_2_LIMIT = new BigDecimal("200.00");
    public static final BigDecimal DEFAULT_SLAB_2_RATE = new BigDecimal("5.00");
    public static final BigDecimal DEFAULT_SLAB_3_RATE = new BigDecimal("7.00");

    public TariffCalculationService(TariffConfigurationRepository tariffRepository) {
        this.tariffRepository = tariffRepository;
    }

    /**
     * Progressive Tariff Calculation Result container.
     */
    public static class CalculationResult {
        private final BigDecimal unitsConsumed;
        private final BigDecimal energyCharges;
        private final BigDecimal fixedCharges;
        private final BigDecimal taxAmount;
        private final BigDecimal subsidyAmount;
        private final BigDecimal lateFee;
        private final BigDecimal totalAmount;

        public CalculationResult(BigDecimal unitsConsumed, BigDecimal energyCharges, BigDecimal fixedCharges,
                                 BigDecimal taxAmount, BigDecimal subsidyAmount, BigDecimal lateFee, BigDecimal totalAmount) {
            this.unitsConsumed = unitsConsumed;
            this.energyCharges = energyCharges;
            this.fixedCharges = fixedCharges;
            this.taxAmount = taxAmount;
            this.subsidyAmount = subsidyAmount;
            this.lateFee = lateFee;
            this.totalAmount = totalAmount;
        }

        public BigDecimal getUnitsConsumed() { return unitsConsumed; }
        public BigDecimal getEnergyCharges() { return energyCharges; }
        public BigDecimal getFixedCharges() { return fixedCharges; }
        public BigDecimal getTaxAmount() { return taxAmount; }
        public BigDecimal getSubsidyAmount() { return subsidyAmount; }
        public BigDecimal getLateFee() { return lateFee; }
        public BigDecimal getTotalAmount() { return totalAmount; }
    }

    /**
     * Calculates energy charges alone based on progressive slabs.
     * Example:
     * For 250 units with default residential rates:
     * - First 100 units @ ₹3 = ₹300
     * - Next 100 units @ ₹5 = ₹500
     * - Remaining 50 units @ ₹7 = ₹350
     * Total Energy Charge = ₹1,150.00
     */
    public BigDecimal calculateEnergyCharges(BigDecimal units, BigDecimal slab1Limit, BigDecimal slab1Rate,
                                             BigDecimal slab2Limit, BigDecimal slab2Rate, BigDecimal slab3Rate) {
        if (units == null || units.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal remainingUnits = units;
        BigDecimal totalCharge = BigDecimal.ZERO;

        // Slab 1 (0 to slab1Limit)
        if (remainingUnits.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitsInSlab1 = remainingUnits.min(slab1Limit);
            totalCharge = totalCharge.add(unitsInSlab1.multiply(slab1Rate));
            remainingUnits = remainingUnits.subtract(unitsInSlab1);
        }

        // Slab 2 (slab1Limit to slab2Limit)
        BigDecimal slab2Capacity = slab2Limit.subtract(slab1Limit);
        if (remainingUnits.compareTo(BigDecimal.ZERO) > 0 && slab2Capacity.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal unitsInSlab2 = remainingUnits.min(slab2Capacity);
            totalCharge = totalCharge.add(unitsInSlab2.multiply(slab2Rate));
            remainingUnits = remainingUnits.subtract(unitsInSlab2);
        }

        // Slab 3 (above slab2Limit)
        if (remainingUnits.compareTo(BigDecimal.ZERO) > 0) {
            totalCharge = totalCharge.add(remainingUnits.multiply(slab3Rate));
        }

        return totalCharge.setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Comprehensive bill calculation including energy, fixed charges, taxes, subsidies, and late fees.
     */
    public CalculationResult calculateBill(ConnectionType connectionType, BigDecimal unitsConsumed, boolean isLate) {
        if (unitsConsumed == null || unitsConsumed.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Units consumed cannot be negative");
        }

        // Lookup tariff configuration from DB or use standard defaults
        TariffConfiguration config = tariffRepository.findByConnectionTypeAndIsActiveTrue(connectionType)
                .orElse(getDefaultTariffConfiguration(connectionType));

        BigDecimal slab1Limit = config.getSlab1Limit();
        BigDecimal slab1Rate = config.getSlab1Rate();
        BigDecimal slab2Limit = config.getSlab2Limit();
        BigDecimal slab2Rate = config.getSlab2Rate();
        BigDecimal slab3Rate = config.getSlab3Rate();

        BigDecimal energyCharges = calculateEnergyCharges(unitsConsumed, slab1Limit, slab1Rate, slab2Limit, slab2Rate, slab3Rate);
        BigDecimal fixedCharges = config.getFixedCharge() != null ? config.getFixedCharge() : BigDecimal.ZERO;
        BigDecimal subsidyAmount = config.getSubsidyAmount() != null ? config.getSubsidyAmount() : BigDecimal.ZERO;

        BigDecimal taxableBase = energyCharges.add(fixedCharges);
        BigDecimal taxRate = config.getTaxPercentage() != null ? config.getTaxPercentage() : BigDecimal.ZERO;
        BigDecimal taxAmount = taxableBase.multiply(taxRate)
                .divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);

        BigDecimal lateFee = BigDecimal.ZERO;
        if (isLate && config.getLateFeePercentage() != null && config.getLateFeePercentage().compareTo(BigDecimal.ZERO) > 0) {
            lateFee = taxableBase.multiply(config.getLateFeePercentage())
                    .divide(new BigDecimal("100.00"), 2, RoundingMode.HALF_UP);
        }

        BigDecimal total = energyCharges.add(fixedCharges).add(taxAmount).add(lateFee).subtract(subsidyAmount);
        if (total.compareTo(BigDecimal.ZERO) < 0) {
            total = BigDecimal.ZERO;
        }

        return new CalculationResult(
                unitsConsumed.setScale(2, RoundingMode.HALF_UP),
                energyCharges.setScale(2, RoundingMode.HALF_UP),
                fixedCharges.setScale(2, RoundingMode.HALF_UP),
                taxAmount.setScale(2, RoundingMode.HALF_UP),
                subsidyAmount.setScale(2, RoundingMode.HALF_UP),
                lateFee.setScale(2, RoundingMode.HALF_UP),
                total.setScale(2, RoundingMode.HALF_UP)
        );
    }

    private TariffConfiguration getDefaultTariffConfiguration(ConnectionType type) {
        TariffConfiguration c = new TariffConfiguration();
        c.setConnectionType(type != null ? type : ConnectionType.RESIDENTIAL);
        c.setSlab1Limit(DEFAULT_SLAB_1_LIMIT);
        c.setSlab1Rate(DEFAULT_SLAB_1_RATE);
        c.setSlab2Limit(DEFAULT_SLAB_2_LIMIT);
        c.setSlab2Rate(DEFAULT_SLAB_2_RATE);
        c.setSlab3Rate(DEFAULT_SLAB_3_RATE);
        c.setFixedCharge(BigDecimal.ZERO);
        c.setTaxPercentage(BigDecimal.ZERO);
        c.setSubsidyAmount(BigDecimal.ZERO);
        c.setLateFeePercentage(BigDecimal.ZERO);
        c.setIsActive(true);
        return c;
    }
}
