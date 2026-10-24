package com.electricity.billing.controller;

import com.electricity.billing.dto.ApiResponse;
import com.electricity.billing.dto.BillGenerationRequestDTO;
import com.electricity.billing.dto.BillResponseDTO;
import com.electricity.billing.entity.enums.BillStatus;
import com.electricity.billing.service.BillService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/bills/generate")
    public ResponseEntity<ApiResponse<BillResponseDTO>> generateBill(
            @Valid @RequestBody BillGenerationRequestDTO request) {
        BillResponseDTO response = billService.generateBill(request);
        return new ResponseEntity<>(ApiResponse.success("Electricity bill generated successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/bills")
    public ResponseEntity<ApiResponse<List<BillResponseDTO>>> getAllBills() {
        List<BillResponseDTO> bills = billService.getAllBills();
        return ResponseEntity.ok(ApiResponse.success("Bills retrieved successfully", bills));
    }

    @GetMapping("/bills/{id}")
    public ResponseEntity<ApiResponse<BillResponseDTO>> getBillById(@PathVariable Long id) {
        BillResponseDTO bill = billService.getBillById(id);
        return ResponseEntity.ok(ApiResponse.success("Bill retrieved successfully", bill));
    }

    @GetMapping("/bills/number/{billNumber}")
    public ResponseEntity<ApiResponse<BillResponseDTO>> getBillByNumber(@PathVariable String billNumber) {
        BillResponseDTO bill = billService.getBillByBillNumber(billNumber);
        return ResponseEntity.ok(ApiResponse.success("Bill retrieved successfully", bill));
    }

    @GetMapping("/customers/{customerId}/bills")
    public ResponseEntity<ApiResponse<List<BillResponseDTO>>> getBillsByCustomer(@PathVariable Long customerId) {
        List<BillResponseDTO> bills = billService.getBillsByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer bills retrieved successfully", bills));
    }

    @GetMapping("/bills/status/{status}")
    public ResponseEntity<ApiResponse<List<BillResponseDTO>>> getBillsByStatus(@PathVariable BillStatus status) {
        List<BillResponseDTO> bills = billService.getBillsByStatus(status);
        return ResponseEntity.ok(ApiResponse.success("Bills filtered by status retrieved successfully", bills));
    }

    @GetMapping("/bills/period")
    public ResponseEntity<ApiResponse<List<BillResponseDTO>>> getBillsByPeriod(
            @RequestParam Integer month,
            @RequestParam Integer year) {
        List<BillResponseDTO> bills = billService.getBillsByPeriod(month, year);
        return ResponseEntity.ok(ApiResponse.success("Bills for specified period retrieved successfully", bills));
    }
}
