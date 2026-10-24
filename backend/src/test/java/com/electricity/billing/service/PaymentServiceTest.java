package com.electricity.billing.service;

import com.electricity.billing.dto.PaymentRequestDTO;
import com.electricity.billing.dto.PaymentResponseDTO;
import com.electricity.billing.entity.Bill;
import com.electricity.billing.entity.Customer;
import com.electricity.billing.entity.Payment;
import com.electricity.billing.entity.enums.BillStatus;
import com.electricity.billing.entity.enums.PaymentMethod;
import com.electricity.billing.exception.DuplicateResourceException;
import com.electricity.billing.exception.InvalidOperationException;
import com.electricity.billing.repository.BillRepository;
import com.electricity.billing.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private BillRepository billRepository;

    private PaymentService paymentService;

    private Bill testBill;
    private Customer testCustomer;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentService(paymentRepository, billRepository);

        testCustomer = new Customer();
        testCustomer.setId(1L);
        testCustomer.setConsumerNumber("CON-1001");
        testCustomer.setFullName("Rahul Sharma");

        testBill = new Bill();
        testBill.setId(10L);
        testBill.setBillNumber("BILL-202610-1001");
        testBill.setCustomer(testCustomer);
        testBill.setTotalAmount(new BigDecimal("1000.00"));
        testBill.setPaidAmount(BigDecimal.ZERO);
        testBill.setOutstandingBalance(new BigDecimal("1000.00"));
        testBill.setStatus(BillStatus.PENDING);
    }

    @Test
    @DisplayName("Should successfully record partial payment and transition status to PARTIALLY_PAID")
    void testPartialPaymentSuccess() {
        when(billRepository.findById(10L)).thenReturn(Optional.of(testBill));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(100L);
            return p;
        });

        PaymentRequestDTO request = new PaymentRequestDTO(10L, new BigDecimal("400.00"), LocalDate.now(), PaymentMethod.UPI, "Partial installment");
        PaymentResponseDTO response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("400.00"), response.getAmountPaid());
        assertEquals(new BigDecimal("600.00"), response.getRemainingBillBalance());
        assertEquals(BillStatus.PARTIALLY_PAID, response.getNewBillStatus());

        assertEquals(new BigDecimal("400.00"), testBill.getPaidAmount());
        assertEquals(new BigDecimal("600.00"), testBill.getOutstandingBalance());
        assertEquals(BillStatus.PARTIALLY_PAID, testBill.getStatus());

        verify(billRepository).save(testBill);
    }

    @Test
    @DisplayName("Should successfully record full payment and transition status to PAID")
    void testFullPaymentSuccess() {
        when(billRepository.findById(10L)).thenReturn(Optional.of(testBill));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(i -> {
            Payment p = i.getArgument(0);
            p.setId(101L);
            return p;
        });

        PaymentRequestDTO request = new PaymentRequestDTO(10L, new BigDecimal("1000.00"), LocalDate.now(), PaymentMethod.NET_BANKING, "Full clearance");
        PaymentResponseDTO response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals(new BigDecimal("1000.00"), response.getAmountPaid());
        assertEquals(new BigDecimal("0.00"), response.getRemainingBillBalance());
        assertEquals(BillStatus.PAID, response.getNewBillStatus());

        assertEquals(new BigDecimal("1000.00"), testBill.getPaidAmount());
        assertEquals(new BigDecimal("0.00"), testBill.getOutstandingBalance());
        assertEquals(BillStatus.PAID, testBill.getStatus());
    }

    @Test
    @DisplayName("Should reject payment amount exceeding the outstanding balance")
    void testRejectOverpayment() {
        when(billRepository.findById(10L)).thenReturn(Optional.of(testBill));

        PaymentRequestDTO request = new PaymentRequestDTO(10L, new BigDecimal("1500.00"), LocalDate.now(), PaymentMethod.CASH, "Excessive amount");

        InvalidOperationException ex = assertThrows(InvalidOperationException.class, () ->
                paymentService.processPayment(request));

        assertTrue(ex.getMessage().contains("exceeds outstanding balance"));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject zero or negative payment amounts")
    void testRejectZeroOrNegativePayment() {
        when(billRepository.findById(10L)).thenReturn(Optional.of(testBill));

        PaymentRequestDTO zeroReq = new PaymentRequestDTO(10L, BigDecimal.ZERO, LocalDate.now(), PaymentMethod.UPI, "Zero");
        assertThrows(InvalidOperationException.class, () -> paymentService.processPayment(zeroReq));

        PaymentRequestDTO negativeReq = new PaymentRequestDTO(10L, new BigDecimal("-50.00"), LocalDate.now(), PaymentMethod.UPI, "Negative");
        assertThrows(InvalidOperationException.class, () -> paymentService.processPayment(negativeReq));
    }

    @Test
    @DisplayName("Should reject duplicate transaction references")
    void testRejectDuplicateTransactionReference() {
        when(billRepository.findById(10L)).thenReturn(Optional.of(testBill));
        when(paymentRepository.existsByTransactionReference("TXN-DUP-001")).thenReturn(true);

        PaymentRequestDTO request = new PaymentRequestDTO(10L, new BigDecimal("500.00"), LocalDate.now(), PaymentMethod.UPI, "Dup test");
        request.setTransactionReference("TXN-DUP-001");

        assertThrows(DuplicateResourceException.class, () -> paymentService.processPayment(request));
    }

    @Test
    @DisplayName("Should reject payment on already settled bill")
    void testRejectPaymentOnPaidBill() {
        testBill.setStatus(BillStatus.PAID);
        testBill.setOutstandingBalance(BigDecimal.ZERO);
        testBill.setPaidAmount(new BigDecimal("1000.00"));

        when(billRepository.findById(10L)).thenReturn(Optional.of(testBill));

        PaymentRequestDTO request = new PaymentRequestDTO(10L, new BigDecimal("100.00"), LocalDate.now(), PaymentMethod.UPI, "Extra payment");

        assertThrows(InvalidOperationException.class, () -> paymentService.processPayment(request));
    }
}
