package com.electricity.billing.controller;

import com.electricity.billing.dto.ApiResponse;
import com.electricity.billing.dto.MeterReadingRequestDTO;
import com.electricity.billing.dto.MeterReadingResponseDTO;
import com.electricity.billing.service.MeterReadingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
public class MeterReadingController {

    private final MeterReadingService meterReadingService;

    public MeterReadingController(MeterReadingService meterReadingService) {
        this.meterReadingService = meterReadingService;
    }

    @PostMapping("/meter-readings")
    public ResponseEntity<ApiResponse<MeterReadingResponseDTO>> recordReading(
            @Valid @RequestBody MeterReadingRequestDTO request) {
        MeterReadingResponseDTO response = meterReadingService.recordReading(request);
        return new ResponseEntity<>(ApiResponse.success("Meter reading recorded successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/meter-readings")
    public ResponseEntity<ApiResponse<List<MeterReadingResponseDTO>>> getAllReadings() {
        List<MeterReadingResponseDTO> readings = meterReadingService.getAllReadings();
        return ResponseEntity.ok(ApiResponse.success("Meter readings retrieved successfully", readings));
    }

    @GetMapping("/meter-readings/{id}")
    public ResponseEntity<ApiResponse<MeterReadingResponseDTO>> getReadingById(@PathVariable Long id) {
        MeterReadingResponseDTO reading = meterReadingService.getReadingById(id);
        return ResponseEntity.ok(ApiResponse.success("Meter reading retrieved successfully", reading));
    }

    @GetMapping("/customers/{customerId}/meter-readings")
    public ResponseEntity<ApiResponse<List<MeterReadingResponseDTO>>> getReadingsByCustomer(@PathVariable Long customerId) {
        List<MeterReadingResponseDTO> readings = meterReadingService.getReadingsByCustomerId(customerId);
        return ResponseEntity.ok(ApiResponse.success("Customer meter readings retrieved successfully", readings));
    }

    @GetMapping("/customers/{customerId}/meter-readings/latest-reading")
    public ResponseEntity<ApiResponse<BigDecimal>> getLatestReadingValue(@PathVariable Long customerId) {
        BigDecimal latest = meterReadingService.getLatestReadingForCustomer(customerId);
        return ResponseEntity.ok(ApiResponse.success("Latest reading fetched successfully", latest));
    }
}
