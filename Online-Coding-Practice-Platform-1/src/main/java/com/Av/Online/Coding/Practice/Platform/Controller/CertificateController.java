package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.CertificateService;
import com.Av.Online.Coding.Practice.Platform.dto.CertificateResponse;

@RestController
@RequestMapping("/api/certificates")
public class CertificateController {

    private final CertificateService certificateService;

    public CertificateController(
            CertificateService certificateService) {

        this.certificateService = certificateService;
    }

    // ============================================================
    // GET MY CERTIFICATES
    // ============================================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CertificateResponse>>
    getUserCertificates(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                certificateService.getUserCertificates(userId)
        );
    }

    // ============================================================
    // GET CERTIFICATE BY ID
    // ============================================================

    @GetMapping("/{certificateId}")
    public ResponseEntity<CertificateResponse>
    getCertificateById(
            @PathVariable Long certificateId) {

        return ResponseEntity.ok(
                certificateService.getCertificateById(
                        certificateId
                )
        );
    }

    // ============================================================
    // VERIFY CERTIFICATE
    // ============================================================

    @GetMapping("/verify/{certificateNumber}")
    public ResponseEntity<CertificateResponse>
    verifyCertificate(
            @PathVariable String certificateNumber) {

        return ResponseEntity.ok(
                certificateService.verifyCertificate(
                        certificateNumber
                )
        );
    }

    // ============================================================
    // GET ALL CERTIFICATES
    // ============================================================
    // Useful later for Admin Certificate Management.

    @GetMapping
    public ResponseEntity<List<CertificateResponse>>
    getAllCertificates() {

        return ResponseEntity.ok(
                certificateService.getAllCertificates()
        );
    }
}