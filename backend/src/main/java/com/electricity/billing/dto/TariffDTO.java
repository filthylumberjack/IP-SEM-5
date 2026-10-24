package com.electricity.billing.dto;

import com.electricity.billing.entity.enums.ConnectionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class TariffDTO {

    private Long id;

    @NotNull(message = "Connection type is required")
    private ConnectionType connectionType;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal slab1Limit;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal slab1Rate;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal slab2Limit;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal slab2Rate;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal slab3Rate;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal fixedCharge;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal taxPercentage;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal subsidyAmount;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal lateFeePercentage;

    private Boolean isActive = true;

    public TariffDTO() {
    }

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
}
