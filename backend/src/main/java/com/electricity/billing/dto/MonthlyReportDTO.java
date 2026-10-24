package com.electricity.billing.dto;

import java.math.BigDecimal;

public class MonthlyReportDTO {

    private Integer billingMonth;
    private Integer billingYear;
    private String monthName;
    private long totalBills;
    private BigDecimal totalUnitsConsumed;
    private BigDecimal totalBilledAmount;
    private BigDecimal totalCollectedAmount;
    private BigDecimal totalOutstandingAmount;

    public MonthlyReportDTO() {
    }

    public MonthlyReportDTO(Integer billingMonth, Integer billingYear, String monthName, long totalBills,
                            BigDecimal totalUnitsConsumed, BigDecimal totalBilledAmount,
                            BigDecimal totalCollectedAmount, BigDecimal totalOutstandingAmount) {
        this.billingMonth = billingMonth;
        this.billingYear = billingYear;
        this.monthName = monthName;
        this.totalBills = totalBills;
        this.totalUnitsConsumed = totalUnitsConsumed;
        this.totalBilledAmount = totalBilledAmount;
        this.totalCollectedAmount = totalCollectedAmount;
        this.totalOutstandingAmount = totalOutstandingAmount;
    }

    // Getters and Setters
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

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
    }

    public long getTotalBills() {
        return totalBills;
    }

    public void setTotalBills(long totalBills) {
        this.totalBills = totalBills;
    }

    public BigDecimal getTotalUnitsConsumed() {
        return totalUnitsConsumed;
    }

    public void setTotalUnitsConsumed(BigDecimal totalUnitsConsumed) {
        this.totalUnitsConsumed = totalUnitsConsumed;
    }

    public BigDecimal getTotalBilledAmount() {
        return totalBilledAmount;
    }

    public void setTotalBilledAmount(BigDecimal totalBilledAmount) {
        this.totalBilledAmount = totalBilledAmount;
    }

    public BigDecimal getTotalCollectedAmount() {
        return totalCollectedAmount;
    }

    public void setTotalCollectedAmount(BigDecimal totalCollectedAmount) {
        this.totalCollectedAmount = totalCollectedAmount;
    }

    public BigDecimal getTotalOutstandingAmount() {
        return totalOutstandingAmount;
    }

    public void setTotalOutstandingAmount(BigDecimal totalOutstandingAmount) {
        this.totalOutstandingAmount = totalOutstandingAmount;
    }
}
