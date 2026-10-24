package com.electricity.billing.controller;

import com.electricity.billing.dto.ApiResponse;
import com.electricity.billing.dto.PaymentRequestDTO;
import com.electricity.billing.dto.PaymentResponseDTO;
import com.electricity.billing.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/payments")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> processPayment(
            @Valid @RequestBody PaymentRequestDTO request) {
        PaymentResponseDTO response = paymentService.processPayment(request);
        return new ResponseEntity<>(ApiResponse.success("Payment recorded and bill updated successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getAllPayments() {
        List<PaymentResponseDTO> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.success("Payments retrieved successfully", payments));
    }

    @GetMapping("/payments/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentById(@PathVariable Long id) {
        PaymentResponseDTO payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success("Payment retrieved successfully", payment));
    }

    @GetMapping("/bills/{billId}/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponseDTO>>> getPaymentsByBill(@PathVariable Long billId) {
        List<PaymentResponseDTO> payments = paymentService.getPaymentsByBillId(billId);
        return ResponseEntity.ok(ApiResponse.success("Bill payments retrieved successfully", payments));
    }
}
