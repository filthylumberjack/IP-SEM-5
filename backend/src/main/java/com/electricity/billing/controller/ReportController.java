package com.electricity.billing.controller;

import com.electricity.billing.dto.ApiResponse;
import com.electricity.billing.dto.MonthlyReportDTO;
import com.electricity.billing.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final DashboardService dashboardService;

    public ReportController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<ApiResponse<List<MonthlyReportDTO>>> getMonthlyReport() {
        List<MonthlyReportDTO> reports = dashboardService.getMonthlyReports();
        return ResponseEntity.ok(ApiResponse.success("Monthly billing report retrieved successfully", reports));
    }
}
