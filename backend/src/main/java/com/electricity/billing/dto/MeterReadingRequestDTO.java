package com.electricity.billing.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public class MeterReadingRequestDTO {

    @NotNull(message = "Customer ID is required")
    private Long customerId;

    @NotNull(message = "Billing month is required")
    @Min(value = 1, message = "Billing month must be between 1 and 12")
    @Max(value = 12, message = "Billing month must be between 1 and 12")
    private Integer billingMonth;

    @NotNull(message = "Billing year is required")
    @Min(value = 2000, message = "Billing year must be 2000 or greater")
    private Integer billingYear;

    private LocalDate readingDate;

    // Optional: if null, backend fetches from latest reading for this customer
    private BigDecimal previousReading;

    @NotNull(message = "Current reading is required")
    @DecimalMin(value = "0.00", message = "Current reading cannot be negative")
    private BigDecimal currentReading;

    private String remarks;

    public MeterReadingRequestDTO() {
    }

    public MeterReadingRequestDTO(Long customerId, Integer billingMonth, Integer billingYear, LocalDate readingDate,
                                 BigDecimal previousReading, BigDecimal currentReading, String remarks) {
        this.customerId = customerId;
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.readingDate = readingDate;
        this.previousReading = previousReading;
        this.currentReading = currentReading;
        this.remarks = remarks;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Integer getBillingMonth() {
        return billingMonth;
    }

    public void setBillingMonth(Integer billingMonth) {
        this.billingMonth = billingMonth;
    }

    public Integer getBillingYear() {
        return billingYear;
    }

    public void setBillingYear(Integer billingYear) {
        this.billingYear = billingYear;
    }

    public LocalDate getReadingDate() {
        return readingDate;
    }

    public void setReadingDate(LocalDate readingDate) {
        this.readingDate = readingDate;
    }

    public BigDecimal getPreviousReading() {
        return previousReading;
    }

    public void setPreviousReading(BigDecimal previousReading) {
        this.previousReading = previousReading;
    }

    public BigDecimal getCurrentReading() {
        return currentReading;
    }

    public void setCurrentReading(BigDecimal currentReading) {
        this.currentReading = currentReading;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
