package com.electricity.billing.service;

import com.electricity.billing.dto.CustomerDTO;
import com.electricity.billing.entity.Customer;
import com.electricity.billing.entity.enums.CustomerStatus;
import com.electricity.billing.exception.DuplicateResourceException;
import com.electricity.billing.exception.InvalidOperationException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.CustomerRepository;
import com.electricity.billing.repository.MeterReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final BillRepository billRepository;

    public CustomerService(CustomerRepository customerRepository,
                           MeterReadingRepository meterReadingRepository,
                           BillRepository billRepository) {
        this.customerRepository = customerRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.billRepository = billRepository;
    }

    public List<CustomerDTO> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public CustomerDTO getCustomerById(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        return toDTO(customer);
    }

    public CustomerDTO getCustomerByConsumerNumber(String consumerNumber) {
        Customer customer = customerRepository.findByConsumerNumber(consumerNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with Consumer Number: " + consumerNumber));
        return toDTO(customer);
    }

    public List<CustomerDTO> searchCustomers(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCustomers();
        }
        return customerRepository.findByConsumerNumberContainingIgnoreCaseOrFullNameContainingIgnoreCase(query.trim(), query.trim())
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public CustomerDTO createCustomer(CustomerDTO dto) {
        if (customerRepository.existsByConsumerNumber(dto.getConsumerNumber())) {
            throw new DuplicateResourceException("Consumer number already exists: " + dto.getConsumerNumber());
        }

        Customer customer = new Customer();
        customer.setConsumerNumber(dto.getConsumerNumber().trim());
        customer.setFullName(dto.getFullName().trim());
        customer.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        customer.setPhoneNumber(dto.getPhoneNumber().trim());
        customer.setAddress(dto.getAddress().trim());
        customer.setConnectionType(dto.getConnectionType());
        customer.setRegistrationDate(dto.getRegistrationDate() != null ? dto.getRegistrationDate() : LocalDate.now());
        customer.setStatus(dto.getStatus() != null ? dto.getStatus() : CustomerStatus.ACTIVE);

        Customer saved = customerRepository.save(customer);
        return toDTO(saved);
    }

    @Transactional
    public CustomerDTO updateCustomer(Long id, CustomerDTO dto) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        // If consumer number changed, check for conflict
        if (!customer.getConsumerNumber().equalsIgnoreCase(dto.getConsumerNumber())
                && customerRepository.existsByConsumerNumber(dto.getConsumerNumber())) {
            throw new DuplicateResourceException("Consumer number already in use by another customer: " + dto.getConsumerNumber());
        }

        customer.setConsumerNumber(dto.getConsumerNumber().trim());
        customer.setFullName(dto.getFullName().trim());
        customer.setEmail(dto.getEmail() != null ? dto.getEmail().trim() : null);
        customer.setPhoneNumber(dto.getPhoneNumber().trim());
        customer.setAddress(dto.getAddress().trim());
        customer.setConnectionType(dto.getConnectionType());
        if (dto.getRegistrationDate() != null) {
            customer.setRegistrationDate(dto.getRegistrationDate());
        }
        if (dto.getStatus() != null) {
            customer.setStatus(dto.getStatus());
        }

        Customer updated = customerRepository.save(customer);
        return toDTO(updated);
    }

    @Transactional
    public void deactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
        customer.setStatus(CustomerStatus.INACTIVE);
        customerRepository.save(customer);
    }

    @Transactional
    public void deleteOrDeactivateCustomer(Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));

        boolean hasBills = !billRepository.findByCustomerIdOrderByBillingYearDescBillingMonthDesc(id).isEmpty();
        boolean hasReadings = !meterReadingRepository.findByCustomerIdOrderByBillingYearDescBillingMonthDesc(id).isEmpty();

        if (hasBills || hasReadings) {
            // Safe deactivation to preserve financial and reading audit history
            customer.setStatus(CustomerStatus.INACTIVE);
            customerRepository.save(customer);
        } else {
            customerRepository.delete(customer);
        }
    }

    public CustomerDTO toDTO(Customer c) {
        return new CustomerDTO(
                c.getId(),
                c.getConsumerNumber(),
                c.getFullName(),
                c.getEmail(),
                c.getPhoneNumber(),
                c.getAddress(),
                c.getConnectionType(),
                c.getRegistrationDate(),
                c.getStatus()
        );
    }
}
