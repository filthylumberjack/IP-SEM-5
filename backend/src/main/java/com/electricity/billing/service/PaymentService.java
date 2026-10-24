package com.electricity.billing.service;

import com.electricity.billing.dto.PaymentRequestDTO;
import com.electricity.billing.dto.PaymentResponseDTO;
import com.electricity.billing.entity.Bill;
import com.electricity.billing.entity.Payment;
import com.electricity.billing.entity.enums.BillStatus;
import com.electricity.billing.entity.enums.PaymentStatus;
import com.electricity.billing.exception.DuplicateResourceException;
import com.electricity.billing.exception.InvalidOperationException;
import com.electricity.billing.exception.ResourceNotFoundException;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BillRepository billRepository;

    public PaymentService(PaymentRepository paymentRepository, BillRepository billRepository) {
        this.paymentRepository = paymentRepository;
        this.billRepository = billRepository;
    }

    public List<PaymentResponseDTO> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDescCreatedAtDesc()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<PaymentResponseDTO> getPaymentsByBillId(Long billId) {
        if (!billRepository.existsById(billId)) {
            throw new ResourceNotFoundException("Bill not found with ID: " + billId);
        }
        return paymentRepository.findByBillIdOrderByPaymentDateDesc(billId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public PaymentResponseDTO getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found with ID: " + id));
        return toDTO(payment);
    }

    @Transactional
    public PaymentResponseDTO processPayment(PaymentRequestDTO request) {
        Bill bill = billRepository.findById(request.getBillId())
                .orElseThrow(() -> new ResourceNotFoundException("Bill not found with ID: " + request.getBillId()));

        if (bill.getStatus() == BillStatus.PAID || bill.getOutstandingBalance().compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("This bill is already fully paid. No further payments accepted.");
        }

        BigDecimal paymentAmount = request.getAmountPaid();
        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InvalidOperationException("Payment amount must be greater than zero");
        }

        // Check for overpayment
        if (paymentAmount.compareTo(bill.getOutstandingBalance()) > 0) {
            throw new InvalidOperationException(String.format(
                    "Payment amount (₹%.2f) exceeds outstanding balance (₹%.2f)",
                    paymentAmount, bill.getOutstandingBalance()));
        }

        // Unique transaction reference
        String txnRef = request.getTransactionReference();
        if (txnRef == null || txnRef.trim().isEmpty()) {
            String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
            String randomPart = UUID.randomUUID().toString().substring(0, 6).toUpperCase();
            txnRef = String.format("TXN-%s-%s", datePart, randomPart);
        } else {
            txnRef = txnRef.trim();
            if (paymentRepository.existsByTransactionReference(txnRef)) {
                throw new DuplicateResourceException("Transaction reference already exists: " + txnRef);
            }
        }

        // Create Payment record
        Payment payment = new Payment();
        payment.setTransactionReference(txnRef);
        payment.setBill(bill);
        payment.setAmountPaid(paymentAmount.setScale(2, RoundingMode.HALF_UP));
        payment.setPaymentDate(request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        payment.setRemarks(request.getRemarks());

        Payment savedPayment = paymentRepository.save(payment);

        // Update Bill balances and status
        BigDecimal newPaidAmount = bill.getPaidAmount().add(paymentAmount).setScale(2, RoundingMode.HALF_UP);
        BigDecimal newOutstanding = bill.getTotalAmount().subtract(newPaidAmount).setScale(2, RoundingMode.HALF_UP);
        if (newOutstanding.compareTo(BigDecimal.ZERO) < 0) {
            newOutstanding = BigDecimal.ZERO;
        }

        bill.setPaidAmount(newPaidAmount);
        bill.setOutstandingBalance(newOutstanding);

        if (newOutstanding.compareTo(BigDecimal.ZERO) == 0) {
            bill.setStatus(BillStatus.PAID);
        } else {
            bill.setStatus(BillStatus.PARTIALLY_PAID);
        }

        billRepository.save(bill);

        return toDTO(savedPayment);
    }

    public PaymentResponseDTO toDTO(Payment p) {
        PaymentResponseDTO dto = new PaymentResponseDTO();
        dto.setId(p.getId());
        dto.setTransactionReference(p.getTransactionReference());
        dto.setBillId(p.getBill().getId());
        dto.setBillNumber(p.getBill().getBillNumber());
        dto.setCustomerId(p.getBill().getCustomer().getId());
        dto.setCustomerName(p.getBill().getCustomer().getFullName());
        dto.setConsumerNumber(p.getBill().getCustomer().getConsumerNumber());
        dto.setAmountPaid(p.getAmountPaid());
        dto.setPaymentDate(p.getPaymentDate());
        dto.setPaymentMethod(p.getPaymentMethod());
        dto.setPaymentStatus(p.getPaymentStatus());
        dto.setRemarks(p.getRemarks());
        dto.setRemainingBillBalance(p.getBill().getOutstandingBalance());
        dto.setNewBillStatus(p.getBill().getStatus());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
