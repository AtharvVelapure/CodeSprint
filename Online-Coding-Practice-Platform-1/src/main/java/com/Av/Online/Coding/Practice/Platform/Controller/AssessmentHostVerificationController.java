package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentHostVerificationService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentHostVerificationResponse;

@RestController
@RequestMapping("/api/assessment-host")
public class AssessmentHostVerificationController {

    private final AssessmentHostVerificationService
            verificationService;

    public AssessmentHostVerificationController(
            AssessmentHostVerificationService verificationService) {

        this.verificationService = verificationService;
    }

    // ==========================================
    // USER - SUBMIT VERIFICATION REQUEST
    // ==========================================

    @PostMapping(
            value = "/verification-request",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> submitVerificationRequest(

            @RequestParam Long userId,

            @RequestParam String businessName,

            @RequestParam String businessEmail,

            @RequestParam MultipartFile document) {

        AssessmentHostVerificationResponse response =
                verificationService.submitRequest(
                        userId,
                        businessName,
                        businessEmail,
                        document);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // USER - GET LATEST REQUEST
    // ==========================================

    @GetMapping("/verification/{userId}")
    public ResponseEntity<?> getLatestRequest(
            @PathVariable Long userId) {

        AssessmentHostVerificationResponse response =
                verificationService.getLatestRequest(
                        userId);

        if (response == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ADMIN - ALL REQUESTS
    // ==========================================

    @GetMapping("/admin/all")
    public ResponseEntity<List<AssessmentHostVerificationResponse>>
            getAllRequests() {

        return ResponseEntity.ok(
                verificationService.getAllRequests());
    }

    // ==========================================
    // ADMIN - PENDING REQUESTS
    // ==========================================

    @GetMapping("/admin/pending")
    public ResponseEntity<List<AssessmentHostVerificationResponse>>
            getPendingRequests() {

        return ResponseEntity.ok(
                verificationService.getPendingRequests());
    }

    // ==========================================
    // ADMIN - APPROVE
    // ==========================================

    @PutMapping("/admin/{verificationId}/approve")
    public ResponseEntity<?> approveRequest(

            @PathVariable Long verificationId,

            @RequestParam(required = false)
            String adminRemarks) {

        AssessmentHostVerificationResponse response =
                verificationService.approveRequest(
                        verificationId,
                        adminRemarks);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ADMIN - REJECT
    // ==========================================

    @PutMapping("/admin/{verificationId}/reject")
    public ResponseEntity<?> rejectRequest(

            @PathVariable Long verificationId,

            @RequestParam String adminRemarks) {

        AssessmentHostVerificationResponse response =
                verificationService.rejectRequest(
                        verificationId,
                        adminRemarks);

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // ADMIN - VIEW DOCUMENT
    // ==========================================

    @GetMapping("/admin/{verificationId}/document")
    public ResponseEntity<?> getVerificationDocument(

            @PathVariable Long verificationId) {

        Resource resource =
                verificationService
                        .getVerificationDocument(
                                verificationId);

        String contentType =
                verificationService
                        .getVerificationDocumentContentType(
                                verificationId);

        MediaType mediaType;

        try {

            mediaType =
                    MediaType.parseMediaType(
                            contentType);

        } catch (Exception exception) {

            mediaType =
                    MediaType.APPLICATION_OCTET_STREAM;
        }

        return ResponseEntity.ok()
                .contentType(mediaType)
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"verification-document\"")
                .body(resource);
    }
}