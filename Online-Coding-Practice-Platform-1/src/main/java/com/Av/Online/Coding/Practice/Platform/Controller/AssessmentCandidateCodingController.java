package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentCandidateCodingService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCodeResultResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentSaveAnswerRequest;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentSubmitCodeRequest;

@RestController
@RequestMapping("/api/assessment-candidates")
public class AssessmentCandidateCodingController {

    private final AssessmentCandidateCodingService codingService;

    public AssessmentCandidateCodingController(
            AssessmentCandidateCodingService codingService) {

        this.codingService = codingService;
    }

    // =========================================================
    // SAVE ANSWER
    // =========================================================

    /*
     * Candidate-specific invitation token.
     *
     * Example:
     *
     * POST
     * /api/assessment-candidates/{invitationToken}/save-answer
     *
     * The invitation token identifies the candidate's
     * assessment session.
     */

    @PostMapping("/{invitationToken}/save-answer")
    public ResponseEntity<?> saveAnswer(
            @PathVariable String invitationToken,
            @RequestBody AssessmentSaveAnswerRequest request) {

        String message =
                codingService.saveAnswer(
                        invitationToken,
                        request
                );

        return ResponseEntity.ok(message);
    }

    // =========================================================
    // SUBMIT CODE
    // =========================================================

    /*
     * Candidate-specific invitation token.
     *
     * Example:
     *
     * POST
     * /api/assessment-candidates/{invitationToken}/submit-code
     */

    @PostMapping("/{invitationToken}/submit-code")
    public ResponseEntity<?> submitCode(
            @PathVariable String invitationToken,
            @RequestBody AssessmentSubmitCodeRequest request) {

        AssessmentCodeResultResponse response =
                codingService.submitCode(
                        invitationToken,
                        request
                );

        return ResponseEntity.ok(response);
    }
}