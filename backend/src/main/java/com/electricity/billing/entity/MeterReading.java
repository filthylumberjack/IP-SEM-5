package com.electricity.billing.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "meter_readings", uniqueConstraints = {
        @UniqueConstraint(name = "uq_customer_billing_period", columnNames = {"customer_id", "billing_month", "billing_year"})
})
public class MeterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull(message = "Customer is required")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull(message = "Billing month is required")
    @Min(value = 1, message = "Billing month must be between 1 and 12")
    @Max(value = 12, message = "Billing month must be between 1 and 12")
    @Column(name = "billing_month", nullable = false)
    private Integer billingMonth;

    @NotNull(message = "Billing year is required")
    @Min(value = 2000, message = "Billing year must be 2000 or greater")
    @Column(name = "billing_year", nullable = false)
    private Integer billingYear;

    @NotNull(message = "Reading date is required")
    @Column(name = "reading_date", nullable = false)
    private LocalDate readingDate;

    @NotNull(message = "Previous reading is required")
    @DecimalMin(value = "0.00", message = "Previous reading cannot be negative")
    @Column(name = "previous_reading", nullable = false, precision = 12, scale = 2)
    private BigDecimal previousReading = BigDecimal.ZERO;

    @NotNull(message = "Current reading is required")
    @DecimalMin(value = "0.00", message = "Current reading cannot be negative")
    @Column(name = "current_reading", nullable = false, precision = 12, scale = 2)
    private BigDecimal currentReading;

    @NotNull(message = "Units consumed is required")
    @DecimalMin(value = "0.00", message = "Units consumed cannot be negative")
    @Column(name = "units_consumed", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitsConsumed;

    @Column(name = "remarks", length = 255)
    private String remarks;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public MeterReading() {
    }

    public MeterReading(Long id, Customer customer, Integer billingMonth, Integer billingYear, LocalDate readingDate,
                        BigDecimal previousReading, BigDecimal currentReading, BigDecimal unitsConsumed, String remarks) {
        this.id = id;
        this.customer = customer;
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.readingDate = readingDate;
        this.previousReading = previousReading;
        this.currentReading = currentReading;
        this.unitsConsumed = unitsConsumed;
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.readingDate == null) {
            this.readingDate = LocalDate.now();
        }
        if (this.unitsConsumed == null && this.currentReading != null && this.previousReading != null) {
            this.unitsConsumed = this.currentReading.subtract(this.previousReading);
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
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

    public BigDecimal getUnitsConsumed() {
        return unitsConsumed;
    }

    public void setUnitsConsumed(BigDecimal unitsConsumed) {
        this.unitsConsumed = unitsConsumed;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
