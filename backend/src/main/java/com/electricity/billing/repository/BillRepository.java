package com.electricity.billing.repository;

import com.electricity.billing.entity.Bill;
import com.electricity.billing.entity.enums.BillStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface BillRepository extends JpaRepository<Bill, Long> {

    boolean existsByCustomerIdAndBillingMonthAndBillingYear(Long customerId, Integer billingMonth, Integer billingYear);

    Optional<Bill> findByCustomerIdAndBillingMonthAndBillingYear(Long customerId, Integer billingMonth, Integer billingYear);

    Optional<Bill> findByBillNumber(String billNumber);

    List<Bill> findByCustomerIdOrderByBillingYearDescBillingMonthDesc(Long customerId);

    List<Bill> findByStatusOrderByBillingYearDescBillingMonthDesc(BillStatus status);

    List<Bill> findByBillingMonthAndBillingYear(Integer billingMonth, Integer billingYear);

    List<Bill> findByDueDateBeforeAndStatusIn(LocalDate date, Collection<BillStatus> statuses);

    List<Bill> findAllByOrderByBillingYearDescBillingMonthDescBillDateDesc();

    long countByStatus(BillStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Bill b")
    BigDecimal sumTotalBilledAmount();

    @Query("SELECT COALESCE(SUM(b.paidAmount), 0) FROM Bill b")
    BigDecimal sumTotalPaidAmount();

    @Query("SELECT COALESCE(SUM(b.outstandingBalance), 0) FROM Bill b")
    BigDecimal sumTotalOutstandingBalance();

    @Query("SELECT b.billingMonth, b.billingYear, COUNT(b), COALESCE(SUM(b.unitsConsumed), 0), " +
           "COALESCE(SUM(b.totalAmount), 0), COALESCE(SUM(b.paidAmount), 0), COALESCE(SUM(b.outstandingBalance), 0) " +
           "FROM Bill b GROUP BY b.billingYear, b.billingMonth ORDER BY b.billingYear DESC, b.billingMonth DESC")
    List<Object[]> getMonthlyBillingSummaries();
}
