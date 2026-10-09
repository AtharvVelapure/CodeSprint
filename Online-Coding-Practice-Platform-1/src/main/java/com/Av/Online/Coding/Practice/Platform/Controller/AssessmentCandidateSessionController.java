package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentCandidateSessionService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateSessionResponse;

@RestController
@RequestMapping("/api/assessment-candidate-sessions")
public class AssessmentCandidateSessionController {

    private final AssessmentCandidateSessionService sessionService;

    public AssessmentCandidateSessionController(
            AssessmentCandidateSessionService sessionService) {

        this.sessionService = sessionService;
    }

    // =====================================================
    // START / RESUME ASSESSMENT
    // =====================================================

    /*
     * Candidate-specific invitation link:
     *
     * /assessment/invite/{invitationToken}
     *
     * The invitationToken uniquely identifies the
     * candidate's assessment invitation.
     */

    @PostMapping("/{invitationToken}/start")
    public ResponseEntity<?> startAssessment(
            @PathVariable String invitationToken,
            @RequestBody StartAssessmentRequest request) {

        AssessmentCandidateSessionResponse response =
                sessionService.startAssessment(
                        invitationToken,
                        request.getCandidateName()
                );

        return ResponseEntity.ok(response);
    }

    // =====================================================
    // REQUEST DTO
    // =====================================================

    public static class StartAssessmentRequest {

        private String candidateName;

        public StartAssessmentRequest() {
        }

        public String getCandidateName() {
            return candidateName;
        }

        public void setCandidateName(
                String candidateName) {

            this.candidateName = candidateName;
        }
    }
}