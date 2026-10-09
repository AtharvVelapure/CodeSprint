package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentCandidateProblemService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateProblemResponse;

@RestController
@RequestMapping("/api/assessment-candidates")
public class AssessmentCandidateProblemController {

    private final AssessmentCandidateProblemService
            candidateProblemService;

    public AssessmentCandidateProblemController(
            AssessmentCandidateProblemService candidateProblemService) {

        this.candidateProblemService =
                candidateProblemService;
    }

    // =====================================================
    // GET ASSESSMENT PROBLEMS
    // =====================================================

    /*
     * Candidate-specific invitation link:
     *
     * /assessment/invite/{invitationToken}
     *
     * The invitation token identifies:
     *
     * - Candidate
     * - Assessment
     * - Invitation
     *
     * No candidate email is required here.
     */

    @GetMapping("/problems")
    public ResponseEntity<?> getCandidateProblems(
            @RequestParam String invitationToken) {

        List<AssessmentCandidateProblemResponse>
                problems =
                candidateProblemService
                        .getCandidateProblems(
                                invitationToken
                        );

        return ResponseEntity.ok(problems);
    }
}