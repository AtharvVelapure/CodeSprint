package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.CertificationService;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationAttemptResponse;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationQuestionResponse;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationResponse;
import com.Av.Online.Coding.Practice.Platform.security.AuthenticatedUserService;

@RestController
@RequestMapping("/api/certifications")
public class CertificationController {

    private final CertificationService certificationService;
    private final AuthenticatedUserService authenticatedUserService;

    public CertificationController(
            CertificationService certificationService,
            AuthenticatedUserService authenticatedUserService) {

        this.certificationService = certificationService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // ============================================================
    // GET ALL ACTIVE CERTIFICATIONS
    // ============================================================

    @GetMapping
    public ResponseEntity<List<CertificationResponse>>
    getActiveCertifications() {

        return ResponseEntity.ok(
                certificationService.getActiveCertifications()
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
                certificationService.getCertification(
                        certificationId
                )
        );
    }

    // ============================================================
    // GET CERTIFICATION QUESTIONS
    // ============================================================

    @GetMapping("/{certificationId}/questions")
    public ResponseEntity<List<CertificationQuestionResponse>>
    getQuestions(
            @PathVariable Long certificationId) {

        return ResponseEntity.ok(
                certificationService.getQuestions(
                        certificationId
                )
        );
    }

    // ============================================================
    // START CERTIFICATION
    // ============================================================

    @PostMapping("/{certificationId}/start")
    public ResponseEntity<CertificationAttemptResponse>
    startCertification(
            @PathVariable Long certificationId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                certificationService.startCertification(
                        certificationId,
                        userId
                )
        );
    }

    // ============================================================
    // SUBMIT CERTIFICATION
    // ============================================================
    /*
     * Request body format:
     *
     * {
     *     "1": "Java code for question 1",
     *     "2": "Java code for question 2",
     *     "3": "Java code for question 3"
     * }
     *
     * language tells the backend which existing
     * CodeExecutor should be used.
     */

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<CertificationAttemptResponse>
    submitCertification(
            @PathVariable Long attemptId,
            @RequestParam(defaultValue = "java") String language,
            @RequestBody Map<Long, String> answers) {

        CertificationAttemptResponse attempt = certificationService.getAttempt(attemptId);
        authenticatedUserService.requireSelfOrAdmin(attempt.getUserId());

        return ResponseEntity.ok(
                certificationService.submitCertification(
                        attemptId,
                        answers,
                        language
                )
        );
    }

    // ============================================================
    // GET USER ATTEMPTS
    // ============================================================

    @GetMapping("/user/{userId}/attempts")
    public ResponseEntity<List<CertificationAttemptResponse>>
    getUserAttempts(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                certificationService.getUserAttempts(
                        userId
                )
        );
    }

    // ============================================================
    // GET SINGLE ATTEMPT
    // ============================================================

    @GetMapping("/attempts/{attemptId}")
    public ResponseEntity<CertificationAttemptResponse>
    getAttempt(
            @PathVariable Long attemptId) {

        CertificationAttemptResponse attempt =
                certificationService.getAttempt(attemptId);

        authenticatedUserService.requireSelfOrAdmin(
                attempt.getUserId()
        );

        return ResponseEntity.ok(attempt);
    }
}