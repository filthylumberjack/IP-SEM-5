package com.electricity.billing.entity;

import com.electricity.billing.entity.enums.BillStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "bills", uniqueConstraints = {
        @UniqueConstraint(name = "uq_bill_customer_period", columnNames = {"customer_id", "billing_month", "billing_year"})
})
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Bill number is required")
    @Size(max = 50)
    @Column(name = "bill_number", nullable = false, unique = true, length = 50)
    private String billNumber;

    @NotNull(message = "Customer is required")
    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull(message = "Meter reading is required")
    @OneToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "meter_reading_id", nullable = false)
    private MeterReading meterReading;

    @NotNull
    @Column(name = "billing_month", nullable = false)
    private Integer billingMonth;

    @NotNull
    @Column(name = "billing_year", nullable = false)
    private Integer billingYear;

    @NotNull
    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @NotNull
    @Column(name = "due_date", nullable = false)
    private LocalDate dueDate;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "units_consumed", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitsConsumed;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "energy_charges", nullable = false, precision = 12, scale = 2)
    private BigDecimal energyCharges;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "fixed_charges", nullable = false, precision = 12, scale = 2)
    private BigDecimal fixedCharges = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "tax_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal taxAmount = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "subsidy_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal subsidyAmount = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "late_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal lateFee = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "outstanding_balance", nullable = false, precision = 12, scale = 2)
    private BigDecimal outstandingBalance;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private BillStatus status = BillStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public Bill() {
    }

    public Bill(Long id, String billNumber, Customer customer, MeterReading meterReading, Integer billingMonth,
                Integer billingYear, LocalDate billDate, LocalDate dueDate, BigDecimal unitsConsumed,
                BigDecimal energyCharges, BigDecimal fixedCharges, BigDecimal taxAmount, BigDecimal subsidyAmount,
                BigDecimal lateFee, BigDecimal totalAmount, BigDecimal paidAmount, BigDecimal outstandingBalance,
                BillStatus status) {
        this.id = id;
        this.billNumber = billNumber;
        this.customer = customer;
        this.meterReading = meterReading;
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.billDate = billDate;
        this.dueDate = dueDate;
        this.unitsConsumed = unitsConsumed;
        this.energyCharges = energyCharges;
        this.fixedCharges = fixedCharges;
        this.taxAmount = taxAmount;
        this.subsidyAmount = subsidyAmount;
        this.lateFee = lateFee;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
        this.outstandingBalance = outstandingBalance;
        this.status = status;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.billDate == null) {
            this.billDate = LocalDate.now();
        }
        if (this.dueDate == null) {
            this.dueDate = this.billDate.plusDays(15);
        }
        if (this.paidAmount == null) {
            this.paidAmount = BigDecimal.ZERO;
        }
        if (this.outstandingBalance == null && this.totalAmount != null) {
            this.outstandingBalance = this.totalAmount.subtract(this.paidAmount);
        }
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

    public String getBillNumber() {
        return billNumber;
    }

    public void setBillNumber(String billNumber) {
        this.billNumber = billNumber;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public MeterReading getMeterReading() {
        return meterReading;
    }

    public void setMeterReading(MeterReading meterReading) {
        this.meterReading = meterReading;
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

    public LocalDate getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDate billDate) {
        this.billDate = billDate;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public BigDecimal getUnitsConsumed() {
        return unitsConsumed;
    }

    public void setUnitsConsumed(BigDecimal unitsConsumed) {
        this.unitsConsumed = unitsConsumed;
    }

    public BigDecimal getEnergyCharges() {
        return energyCharges;
    }

    public void setEnergyCharges(BigDecimal energyCharges) {
        this.energyCharges = energyCharges;
    }

    public BigDecimal getFixedCharges() {
        return fixedCharges;
    }

    public void setFixedCharges(BigDecimal fixedCharges) {
        this.fixedCharges = fixedCharges;
    }

    public BigDecimal getTaxAmount() {
        return taxAmount;
    }

    public void setTaxAmount(BigDecimal taxAmount) {
        this.taxAmount = taxAmount;
    }

    public BigDecimal getSubsidyAmount() {
        return subsidyAmount;
    }

    public void setSubsidyAmount(BigDecimal subsidyAmount) {
        this.subsidyAmount = subsidyAmount;
    }

    public BigDecimal getLateFee() {
        return lateFee;
    }

    public void setLateFee(BigDecimal lateFee) {
        this.lateFee = lateFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    public BigDecimal getOutstandingBalance() {
        return outstandingBalance;
    }

    public void setOutstandingBalance(BigDecimal outstandingBalance) {
        this.outstandingBalance = outstandingBalance;
    }

    public BillStatus getStatus() {
        return status;
    }

    public void setStatus(BillStatus status) {
        this.status = status;
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
