package com.electricity.billing.repository;

import com.electricity.billing.entity.Customer;
import com.electricity.billing.entity.enums.CustomerStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByConsumerNumber(String consumerNumber);

    Optional<Customer> findByConsumerNumber(String consumerNumber);

    List<Customer> findByConsumerNumberContainingIgnoreCaseOrFullNameContainingIgnoreCase(String consumerNumber, String fullName);

    List<Customer> findByStatus(CustomerStatus status);

    long countByStatus(CustomerStatus status);
}
