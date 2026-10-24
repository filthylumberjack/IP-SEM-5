package com.electricity.billing.service;

import com.electricity.billing.dto.BillGenerationRequestDTO;
import com.electricity.billing.dto.BillResponseDTO;
import com.electricity.billing.entity.Bill;
import com.electricity.billing.entity.Customer;
import com.electricity.billing.entity.MeterReading;
import com.electricity.billing.entity.enums.BillStatus;
import com.electricity.billing.entity.enums.CustomerStatus;
import com.electricity.billing.exception.DuplicateResourceException;
import com.electricity.billing.exception.InvalidOperationException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.CustomerRepository;
import com.electricity.billing.repository.MeterReadingRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class BillService {

    private final BillRepository billRepository;
    private final CustomerRepository customerRepository;
    private final MeterReadingRepository meterReadingRepository;
    private final TariffCalculationService tariffCalculationService;

    public BillService(BillRepository billRepository,
                       CustomerRepository customerRepository,
                       MeterReadingRepository meterReadingRepository,
                       TariffCalculationService tariffCalculationService) {
        this.billRepository = billRepository;
        this.customerRepository = customerRepository;
        this.meterReadingRepository = meterReadingRepository;
        this.tariffCalculationService = tariffCalculationService;
    }

    public List<BillResponseDTO> getAllBills() {
        return billRepository.findAllByOrderByBillingYearDescBillingMonthDescBillDateDesc()
                .stream()
                .map(this::checkAndUpdateOverdue)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public BillResponseDTO getBillById(Long id) {
        Bill bill = billRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + id));
        return toDTO(checkAndUpdateOverdue(bill));
    }

    public BillResponseDTO getBillByBillNumber(String billNumber) {
        Bill bill = billRepository.findByBillNumber(billNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with Bill Number: " + billNumber));
        return toDTO(checkAndUpdateOverdue(bill));
    }

    public List<BillResponseDTO> getBillsByCustomerId(Long customerId) {
        if (!customerRepository.existsById(customerId)) {
            throw new ResourceNotFoundException("Customer not found with ID: " + customerId);
        }
        return billRepository.findByCustomerIdOrderByBillingYearDescBillingMonthDesc(customerId)
                .stream()
                .map(this::checkAndUpdateOverdue)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BillResponseDTO> getBillsByStatus(BillStatus status) {
        return billRepository.findByStatusOrderByBillingYearDescBillingMonthDesc(status)
                .stream()
                .map(this::checkAndUpdateOverdue)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<BillResponseDTO> getBillsByPeriod(Integer month, Integer year) {
        return billRepository.findByBillingMonthAndBillingYear(month, year)
                .stream()
                .map(this::checkAndUpdateOverdue)
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public BillResponseDTO generateBill(BillGenerationRequestDTO request) {
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + request.getCustomerId()));

        if (customer.getStatus() == CustomerStatus.INACTIVE) {
            throw new InvalidOperationException("Cannot generate bill for an inactive customer");
        }

        // Prevent duplicate bills for the same period
        if (billRepository.existsByCustomerIdAndBillingMonthAndBillingYear(
                customer.getId(), request.getBillingMonth(), request.getBillingYear())) {
            throw new DuplicateResourceException(String.format(
                    "A bill has already been generated for customer %s for period %02d/%d",
                    customer.getConsumerNumber(), request.getBillingMonth(), request.getBillingYear()));
        }

        // Locate corresponding meter reading
        MeterReading reading = meterReadingRepository.findByCustomerIdAndBillingMonthAndBillingYear(
                customer.getId(), request.getBillingMonth(), request.getBillingYear())
                .orElseThrow(() -> new InvalidOperationException(String.format(
                        "No meter reading found for customer %s in period %02d/%d. Please record meter reading first.",
                        customer.getConsumerNumber(), request.getBillingMonth(), request.getBillingYear())));

        LocalDate billDate = request.getBillDate() != null ? request.getBillDate() : LocalDate.now();
        LocalDate dueDate = request.getDueDate() != null ? request.getDueDate() : billDate.plusDays(15);

        boolean isLate = LocalDate.now().isAfter(dueDate);

        // Perform progressive tariff calculations
        TariffCalculationService.CalculationResult calc = tariffCalculationService.calculateBill(
                customer.getConnectionType(), reading.getUnitsConsumed(), isLate);

        // Generate unique bill number: BILL-YYYYMM-XXXX
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 4).toUpperCase();
        String billNumber = String.format("BILL-%d%02d-%s", request.getBillingYear(), request.getBillingMonth(), uniqueSuffix);

        Bill bill = new Bill();
        bill.setBillNumber(billNumber);
        bill.setCustomer(customer);
        bill.setMeterReading(reading);
        bill.setBillingMonth(request.getBillingMonth());
        bill.setBillingYear(request.getBillingYear());
        bill.setBillDate(billDate);
        bill.setDueDate(dueDate);
        bill.setUnitsConsumed(calc.getUnitsConsumed());
        bill.setEnergyCharges(calc.getEnergyCharges());
        bill.setFixedCharges(calc.getFixedCharges());
        bill.setTaxAmount(calc.getTaxAmount());
        bill.setSubsidyAmount(calc.getSubsidyAmount());
        bill.setLateFee(calc.getLateFee());
        bill.setTotalAmount(calc.getTotalAmount());
        bill.setPaidAmount(BigDecimal.ZERO);
        bill.setOutstandingBalance(calc.getTotalAmount());
        bill.setStatus(isLate ? BillStatus.OVERDUE : BillStatus.PENDING);

        Bill saved = billRepository.save(bill);
        return toDTO(saved);
    }

    private Bill checkAndUpdateOverdue(Bill bill) {
        if (bill.getStatus() != BillStatus.PAID && LocalDate.now().isAfter(bill.getDueDate())) {
            if (bill.getStatus() != BillStatus.OVERDUE) {
                bill.setStatus(BillStatus.OVERDUE);
                return billRepository.save(bill);
            }
        }
        return bill;
    }

    public BillResponseDTO toDTO(Bill b) {
        BillResponseDTO dto = new BillResponseDTO();
        dto.setId(b.getId());
        dto.setBillNumber(b.getBillNumber());
        dto.setCustomerId(b.getCustomer().getId());
        dto.setCustomerName(b.getCustomer().getFullName());
        dto.setConsumerNumber(b.getCustomer().getConsumerNumber());
        dto.setCustomerAddress(b.getCustomer().getAddress());
        dto.setCustomerPhone(b.getCustomer().getPhoneNumber());
        dto.setConnectionType(b.getCustomer().getConnectionType());
        dto.setMeterReadingId(b.getMeterReading().getId());
        dto.setPreviousReading(b.getMeterReading().getPreviousReading());
        dto.setCurrentReading(b.getMeterReading().getCurrentReading());
        dto.setBillingMonth(b.getBillingMonth());
        dto.setBillingYear(b.getBillingYear());
        dto.setBillDate(b.getBillDate());
        dto.setDueDate(b.getDueDate());
        dto.setUnitsConsumed(b.getUnitsConsumed());
        dto.setEnergyCharges(b.getEnergyCharges());
        dto.setFixedCharges(b.getFixedCharges());
        dto.setTaxAmount(b.getTaxAmount());
        dto.setSubsidyAmount(b.getSubsidyAmount());
        dto.setLateFee(b.getLateFee());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setPaidAmount(b.getPaidAmount());
        dto.setOutstandingBalance(b.getOutstandingBalance());
        dto.setStatus(b.getStatus());
        dto.setCreatedAt(b.getCreatedAt());
        return dto;
    }
}
