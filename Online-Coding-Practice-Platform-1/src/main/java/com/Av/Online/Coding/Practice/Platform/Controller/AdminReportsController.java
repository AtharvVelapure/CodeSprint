package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AdminReportsService;

@RestController
@RequestMapping("/api/admin/reports")
@CrossOrigin(
        origins = {
                "http://localhost:5173",
                "http://127.0.0.1:5173"
        }
)
public class AdminReportsController {

    private final AdminReportsService reportsService;

    public AdminReportsController(
            AdminReportsService reportsService) {

        this.reportsService = reportsService;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getReports() {

        return ResponseEntity.ok(
                reportsService.getReports()
        );
    }
}