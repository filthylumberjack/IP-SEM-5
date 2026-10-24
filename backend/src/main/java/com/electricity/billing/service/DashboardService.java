package com.electricity.billing.service;

import com.electricity.billing.dto.DashboardSummaryDTO;
import com.electricity.billing.dto.MonthlyReportDTO;
import com.electricity.billing.entity.enums.BillStatus;
import com.electricity.billing.entity.enums.CustomerStatus;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.CustomerRepository;
import com.electricity.billing.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
public class DashboardService {

    private final CustomerRepository customerRepository;
    private final BillRepository billRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(CustomerRepository customerRepository,
                            BillRepository billRepository,
                            PaymentRepository paymentRepository) {
        this.customerRepository = customerRepository;
        this.billRepository = billRepository;
        this.paymentRepository = paymentRepository;
    }

    public DashboardSummaryDTO getDashboardSummary() {
        long totalActiveCustomers = customerRepository.countByStatus(CustomerStatus.ACTIVE);
        long totalCustomers = customerRepository.count();
        long totalBillsGenerated = billRepository.count();

        BigDecimal totalBilledAmount = billRepository.sumTotalBilledAmount().setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalPaymentsReceived = paymentRepository.sumTotalPaymentsReceived().setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalOutstandingBalance = billRepository.sumTotalOutstandingBalance().setScale(2, RoundingMode.HALF_UP);

        long pendingBillsCount = billRepository.countByStatus(BillStatus.PENDING);
        long overdueBillsCount = billRepository.countByStatus(BillStatus.OVERDUE);
        long partiallyPaidBillsCount = billRepository.countByStatus(BillStatus.PARTIALLY_PAID);
        long paidBillsCount = billRepository.countByStatus(BillStatus.PAID);

        return new DashboardSummaryDTO(
                totalActiveCustomers,
                totalCustomers,
                totalBillsGenerated,
                totalBilledAmount,
                totalPaymentsReceived,
                totalOutstandingBalance,
                pendingBillsCount,
                overdueBillsCount,
                partiallyPaidBillsCount,
                paidBillsCount
        );
    }

    public List<MonthlyReportDTO> getMonthlyReports() {
        List<Object[]> rawSummaries = billRepository.getMonthlyBillingSummaries();
        List<MonthlyReportDTO> reports = new ArrayList<>();

        for (Object[] row : rawSummaries) {
            Integer month = (Integer) row[0];
            Integer year = (Integer) row[1];
            long billCount = ((Number) row[2]).longValue();
            BigDecimal units = ((BigDecimal) row[3]).setScale(2, RoundingMode.HALF_UP);
            BigDecimal billed = ((BigDecimal) row[4]).setScale(2, RoundingMode.HALF_UP);
            BigDecimal collected = ((BigDecimal) row[5]).setScale(2, RoundingMode.HALF_UP);
            BigDecimal outstanding = ((BigDecimal) row[6]).setScale(2, RoundingMode.HALF_UP);

            String monthName = (month >= 1 && month <= 12)
                    ? Month.of(month).getDisplayName(TextStyle.FULL, Locale.ENGLISH)
                    : "Month " + month;

            reports.add(new MonthlyReportDTO(
                    month,
                    year,
                    monthName + " " + year,
                    billCount,
                    units,
                    billed,
                    collected,
                    outstanding
            ));
        }

        return reports;
    }
}
