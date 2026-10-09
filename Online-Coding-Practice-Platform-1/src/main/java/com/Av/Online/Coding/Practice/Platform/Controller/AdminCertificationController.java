package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.AdminCertificationResultService;
import com.Av.Online.Coding.Practice.Platform.Service.AdminCertificationService;
import com.Av.Online.Coding.Practice.Platform.dto.AdminCertificationResultsResponse;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Certification;

@RestController
@RequestMapping("/api/admin/certifications")
public class AdminCertificationController {

    private final AdminCertificationService certificationService;

    private final AdminCertificationResultService
            certificationResultService;

    public AdminCertificationController(
            AdminCertificationService certificationService,
            AdminCertificationResultService certificationResultService) {

        this.certificationService =
                certificationService;

        this.certificationResultService =
                certificationResultService;
    }

    // ============================================================
    // CREATE CERTIFICATION
    // ============================================================

    @PostMapping
    public ResponseEntity<CertificationResponse> createCertification(
            @RequestBody Certification certification) {

        return ResponseEntity.ok(
                certificationService.createCertification(
                        certification
                )
        );
    }

    // ============================================================
    // GET ALL CERTIFICATIONS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<CertificationResponse>>
    getAllCertifications() {

        return ResponseEntity.ok(
                certificationService.getAllCertifications()
        );
    }

    // ============================================================
    // GET CERTIFICATION BY ID
    // ============================================================

    @GetMapping("/{certificationId}")
    public ResponseEntity<CertificationResponse>
    getCertificationById(
            @PathVariable Long certificationId) {

        return ResponseEntity.ok(
                certificationService.getCertificationById(
                        certificationId
                )
        );
    }

    // ============================================================
    // GET CERTIFICATION RESULTS
    // ============================================================

    @GetMapping("/{certificationId}/results")
    public ResponseEntity<AdminCertificationResultsResponse>
    getCertificationResults(
            @PathVariable Long certificationId) {

        return ResponseEntity.ok(
                certificationResultService
                        .getCertificationResults(
                                certificationId
                        )
        );
    }

    // ============================================================
    // UPDATE CERTIFICATION
    // ============================================================

    @PutMapping("/{certificationId}")
    public ResponseEntity<CertificationResponse> updateCertification(
            @PathVariable Long certificationId,
            @RequestBody Certification certification) {

        return ResponseEntity.ok(
                certificationService.updateCertification(
                        certificationId,
                        certification
                )
        );
    }

    // ============================================================
    // ACTIVATE CERTIFICATION
    // ============================================================

    @PutMapping("/{certificationId}/activate")
    public ResponseEntity<CertificationResponse> activateCertification(
            @PathVariable Long certificationId) {

        return ResponseEntity.ok(
                certificationService.activateCertification(
                        certificationId
                )
        );
    }

    // ============================================================
    // DEACTIVATE CERTIFICATION
    // ============================================================

    @PutMapping("/{certificationId}/deactivate")
    public ResponseEntity<CertificationResponse> deactivateCertification(
            @PathVariable Long certificationId) {

        return ResponseEntity.ok(
                certificationService.deactivateCertification(
                        certificationId
                )
        );
    }

    // ============================================================
    // DELETE CERTIFICATION
    // ============================================================

    @DeleteMapping("/{certificationId}")
    public ResponseEntity<String> deleteCertification(
            @PathVariable Long certificationId) {

        certificationService.deleteCertification(
                certificationId
        );

        return ResponseEntity.ok(
                "Certification deleted successfully"
        );
    }
}