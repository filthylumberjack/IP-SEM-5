package com.electricity.billing.repository;

import com.electricity.billing.entity.MeterReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MeterReadingRepository extends JpaRepository<MeterReading, Long> {

    Optional<MeterReading> findByCustomerIdAndBillingMonthAndBillingYear(Long customerId, Integer billingMonth, Integer billingYear);

    boolean existsByCustomerIdAndBillingMonthAndBillingYear(Long customerId, Integer billingMonth, Integer billingYear);

    List<MeterReading> findByCustomerIdOrderByBillingYearDescBillingMonthDesc(Long customerId);

    Optional<MeterReading> findTopByCustomerIdOrderByBillingYearDescBillingMonthDesc(Long customerId);

    List<MeterReading> findAllByOrderByBillingYearDescBillingMonthDescReadingDateDesc();
}
