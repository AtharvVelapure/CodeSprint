
package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.SubmissionService;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;
import com.Av.Online.Coding.Practice.Platform.security.AuthenticatedUserService;

@RestController
@RequestMapping("/api/submissions")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final AuthenticatedUserService authenticatedUserService;

    public SubmissionController(
            SubmissionService submissionService,
            AuthenticatedUserService authenticatedUserService) {

        this.submissionService = submissionService;
        this.authenticatedUserService = authenticatedUserService;
    }

    // ========================================
    // CREATE SUBMISSION
    // ========================================

    @PostMapping
    public ResponseEntity<Submission> createSubmission(
            @RequestBody Submission submission) {

        Submission createdSubmission =
                submissionService.createSubmission(submission);

        return ResponseEntity.ok(createdSubmission);
    }

    // ========================================
    // GET ALL SUBMISSIONS
    // Admin access is enforced by SecurityConfig.
    // ========================================

    @GetMapping
    public ResponseEntity<List<Submission>> getAllSubmissions() {

        return ResponseEntity.ok(
                submissionService.getAllSubmissions()
        );
    }

    // ========================================
    // GET USER SUBMISSIONS
    // ========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Submission>> getUserSubmissions(
            @PathVariable Long userId) {

        authenticatedUserService.requireSelfOrAdmin(userId);

        return ResponseEntity.ok(
                submissionService.getUserSubmissions(userId)
        );
    }

    // ========================================
    // GET USER DASHBOARD DATA
    // ========================================

    @GetMapping("/user/{userId}/dashboard")
    public ResponseEntity<Map<String, Object>> getUserDashboardData(
            @PathVariable Long userId) {

        authenticatedUserService.requireSelfOrAdmin(userId);

        return ResponseEntity.ok(
                submissionService.getUserDashboardData(userId)
        );
    }

    // ========================================
    // GET USER PROBLEM SUBMISSIONS
    // ========================================

    @GetMapping("/user/{userId}/problem/{problemId}")
    public ResponseEntity<List<Submission>> getUserProblemSubmissions(
            @PathVariable Long userId,
            @PathVariable Long problemId) {

        authenticatedUserService.requireSelfOrAdmin(userId);

        return ResponseEntity.ok(
                submissionService.getUserProblemSubmissions(
                        userId,
                        problemId
                )
        );
    }

    // ========================================
    // GET SUBMISSION BY ID
    // ========================================

    @GetMapping("/{id}")
    public ResponseEntity<Submission> getSubmissionById(
            @PathVariable Long id) {

        Submission submission =
                submissionService.getSubmissionById(id);

        authenticatedUserService.requireSelfOrAdmin(
                submission.getUserId()
        );

        return ResponseEntity.ok(submission);
    }

    // ========================================
    // DELETE SUBMISSION
    // ========================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteSubmission(
            @PathVariable Long id) {

        submissionService.deleteSubmission(id);

        return ResponseEntity.ok(
                "Submission deleted successfully"
        );
    }
}
