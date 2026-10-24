package com.electricity.billing.dto;

import java.math.BigDecimal;

public class DashboardSummaryDTO {

    private long totalActiveCustomers;
    private long totalCustomers;
    private long totalBillsGenerated;
    private BigDecimal totalBilledAmount;
    private BigDecimal totalPaymentsReceived;
    private BigDecimal totalOutstandingBalance;
    private long pendingBillsCount;
    private long overdueBillsCount;
    private long partiallyPaidBillsCount;
    private long paidBillsCount;

    public DashboardSummaryDTO() {
    }

    public DashboardSummaryDTO(long totalActiveCustomers, long totalCustomers, long totalBillsGenerated,
                               BigDecimal totalBilledAmount, BigDecimal totalPaymentsReceived,
                               BigDecimal totalOutstandingBalance, long pendingBillsCount,
                               long overdueBillsCount, long partiallyPaidBillsCount, long paidBillsCount) {
        this.totalActiveCustomers = totalActiveCustomers;
        this.totalCustomers = totalCustomers;
        this.totalBillsGenerated = totalBillsGenerated;
        this.totalBilledAmount = totalBilledAmount;
        this.totalPaymentsReceived = totalPaymentsReceived;
        this.totalOutstandingBalance = totalOutstandingBalance;
        this.pendingBillsCount = pendingBillsCount;
        this.overdueBillsCount = overdueBillsCount;
        this.partiallyPaidBillsCount = partiallyPaidBillsCount;
        this.paidBillsCount = paidBillsCount;
    }

    // Getters and Setters
    public long getTotalActiveCustomers() {
        return totalActiveCustomers;
    }

    public void setTotalActiveCustomers(long totalActiveCustomers) {
        this.totalActiveCustomers = totalActiveCustomers;
    }

    public long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public long getTotalBillsGenerated() {
        return totalBillsGenerated;
    }

    public void setTotalBillsGenerated(long totalBillsGenerated) {
        this.totalBillsGenerated = totalBillsGenerated;
    }

    public BigDecimal getTotalBilledAmount() {
        return totalBilledAmount;
    }

    public void setTotalBilledAmount(BigDecimal totalBilledAmount) {
        this.totalBilledAmount = totalBilledAmount;
    }

    public BigDecimal getTotalPaymentsReceived() {
        return totalPaymentsReceived;
    }

    public void setTotalPaymentsReceived(BigDecimal totalPaymentsReceived) {
        this.totalPaymentsReceived = totalPaymentsReceived;
    }

    public BigDecimal getTotalOutstandingBalance() {
        return totalOutstandingBalance;
    }

    public void setTotalOutstandingBalance(BigDecimal totalOutstandingBalance) {
        this.totalOutstandingBalance = totalOutstandingBalance;
    }

    public long getPendingBillsCount() {
        return pendingBillsCount;
    }

    public void setPendingBillsCount(long pendingBillsCount) {
        this.pendingBillsCount = pendingBillsCount;
    }

    public long getOverdueBillsCount() {
        return overdueBillsCount;
    }

    public void setOverdueBillsCount(long overdueBillsCount) {
        this.overdueBillsCount = overdueBillsCount;
    }

    public long getPartiallyPaidBillsCount() {
        return partiallyPaidBillsCount;
    }

    public void setPartiallyPaidBillsCount(long partiallyPaidBillsCount) {
        this.partiallyPaidBillsCount = partiallyPaidBillsCount;
    }

    public long getPaidBillsCount() {
        return paidBillsCount;
    }

    public void setPaidBillsCount(long paidBillsCount) {
        this.paidBillsCount = paidBillsCount;
    }
}
