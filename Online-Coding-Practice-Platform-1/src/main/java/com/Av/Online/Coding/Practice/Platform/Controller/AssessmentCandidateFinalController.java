package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentCandidateFinalService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentFinalResultResponse;

@RestController
@RequestMapping("/api/assessment-candidates")
public class AssessmentCandidateFinalController {

    private final AssessmentCandidateFinalService finalService;

    public AssessmentCandidateFinalController(
            AssessmentCandidateFinalService finalService) {

        this.finalService = finalService;
    }

    // =========================================================
    // SUBMIT ASSESSMENT
    // =========================================================

    /*
     * Candidate-specific invitation token.
     *
     * Example:
     *
     * POST
     * /api/assessment-candidates/{invitationToken}/submit-assessment
     *
     * The invitation token identifies the candidate's
     * assessment invitation and session.
     */

    @PostMapping("/{invitationToken}/submit-assessment")
    public ResponseEntity<?> submitAssessment(
            @PathVariable String invitationToken) {

        AssessmentFinalResultResponse response =
                finalService.submitAssessment(
                        invitationToken
                );

        return ResponseEntity.ok(response);
    }
}