package com.electricity.billing.entity;

import com.electricity.billing.entity.enums.ConnectionType;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tariff_configurations")
public class TariffConfiguration {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "connection_type", nullable = false, unique = true, length = 30)
    private ConnectionType connectionType;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "slab_1_limit", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab1Limit = new BigDecimal("100.00");

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "slab_1_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab1Rate = new BigDecimal("3.00");

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "slab_2_limit", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab2Limit = new BigDecimal("200.00");

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "slab_2_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab2Rate = new BigDecimal("5.00");

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "slab_3_rate", nullable = false, precision = 10, scale = 2)
    private BigDecimal slab3Rate = new BigDecimal("7.00");

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "fixed_charge", nullable = false, precision = 10, scale = 2)
    private BigDecimal fixedCharge = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "tax_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal taxPercentage = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "subsidy_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal subsidyAmount = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "late_fee_percentage", nullable = false, precision = 5, scale = 2)
    private BigDecimal lateFeePercentage = BigDecimal.ZERO;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public TariffConfiguration() {
    }

    public TariffConfiguration(Long id, ConnectionType connectionType, BigDecimal slab1Limit, BigDecimal slab1Rate,
                               BigDecimal slab2Limit, BigDecimal slab2Rate, BigDecimal slab3Rate,
                               BigDecimal fixedCharge, BigDecimal taxPercentage, BigDecimal subsidyAmount,
                               BigDecimal lateFeePercentage, Boolean isActive) {
        this.id = id;
        this.connectionType = connectionType;
        this.slab1Limit = slab1Limit;
        this.slab1Rate = slab1Rate;
        this.slab2Limit = slab2Limit;
        this.slab2Rate = slab2Rate;
        this.slab3Rate = slab3Rate;
        this.fixedCharge = fixedCharge;
        this.taxPercentage = taxPercentage;
        this.subsidyAmount = subsidyAmount;
        this.lateFeePercentage = lateFeePercentage;
        this.isActive = isActive;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ConnectionType getConnectionType() {
        return connectionType;
    }

    public void setConnectionType(ConnectionType connectionType) {
        this.connectionType = connectionType;
    }

    public BigDecimal getSlab1Limit() {
        return slab1Limit;
    }

    public void setSlab1Limit(BigDecimal slab1Limit) {
        this.slab1Limit = slab1Limit;
    }

    public BigDecimal getSlab1Rate() {
        return slab1Rate;
    }

    public void setSlab1Rate(BigDecimal slab1Rate) {
        this.slab1Rate = slab1Rate;
    }

    public BigDecimal getSlab2Limit() {
        return slab2Limit;
    }

    public void setSlab2Limit(BigDecimal slab2Limit) {
        this.slab2Limit = slab2Limit;
    }

    public BigDecimal getSlab2Rate() {
        return slab2Rate;
    }

    public void setSlab2Rate(BigDecimal slab2Rate) {
        this.slab2Rate = slab2Rate;
    }

    public BigDecimal getSlab3Rate() {
        return slab3Rate;
    }

    public void setSlab3Rate(BigDecimal slab3Rate) {
        this.slab3Rate = slab3Rate;
    }

    public BigDecimal getFixedCharge() {
        return fixedCharge;
    }

    public void setFixedCharge(BigDecimal fixedCharge) {
        this.fixedCharge = fixedCharge;
    }

    public BigDecimal getTaxPercentage() {
        return taxPercentage;
    }

    public void setTaxPercentage(BigDecimal taxPercentage) {
        this.taxPercentage = taxPercentage;
    }

    public BigDecimal getSubsidyAmount() {
        return subsidyAmount;
    }

    public void setSubsidyAmount(BigDecimal subsidyAmount) {
        this.subsidyAmount = subsidyAmount;
    }

    public BigDecimal getLateFeePercentage() {
        return lateFeePercentage;
    }

    public void setLateFeePercentage(BigDecimal lateFeePercentage) {
        this.lateFeePercentage = lateFeePercentage;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean active) {
        isActive = active;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
