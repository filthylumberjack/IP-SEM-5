package com.electricity.billing.controller;

import com.electricity.billing.dto.ApiResponse;
import com.electricity.billing.dto.TariffDTO;
import com.electricity.billing.entity.enums.ConnectionType;
import com.electricity.billing.service.TariffService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tariffs")
public class TariffController {

    private final TariffService tariffService;

    public TariffController(TariffService tariffService) {
        this.tariffService = tariffService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<TariffDTO>>> getAllTariffs() {
        List<TariffDTO> tariffs = tariffService.getAllTariffs();
        return ResponseEntity.ok(ApiResponse.success("Tariff configurations retrieved successfully", tariffs));
    }

    @GetMapping("/connection-type/{type}")
    public ResponseEntity<ApiResponse<TariffDTO>> getTariffByType(@PathVariable ConnectionType type) {
        TariffDTO tariff = tariffService.getTariffByConnectionType(type);
        return ResponseEntity.ok(ApiResponse.success("Tariff configuration retrieved successfully", tariff));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<TariffDTO>> updateTariff(
            @PathVariable Long id,
            @Valid @RequestBody TariffDTO tariffDTO) {
        TariffDTO updated = tariffService.updateTariff(id, tariffDTO);
        return ResponseEntity.ok(ApiResponse.success("Tariff configuration updated successfully", updated));
    }
}
