package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentHostResultService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentHostResultDetailResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentHostResultSummaryResponse;

@RestController
@RequestMapping("/api/assessment-results")
public class AssessmentHostResultController {

    private final AssessmentHostResultService resultService;


    public AssessmentHostResultController(
            AssessmentHostResultService resultService) {

        this.resultService = resultService;
    }


    // =========================================================
    // GET ALL RESULTS FOR ASSESSMENT
    // =========================================================

    @GetMapping("/{assessmentId}")
    public ResponseEntity<?> getAssessmentResults(
            @PathVariable Long assessmentId,
            @RequestParam Long userId) {

        List<AssessmentHostResultSummaryResponse> results =
                resultService.getAssessmentResults(
                        userId,
                        assessmentId
                );

        return ResponseEntity.ok(results);
    }


    // =========================================================
    // GET ONE CANDIDATE RESULT
    // =========================================================

    @GetMapping("/{assessmentId}/candidate/{invitationId}")
    public ResponseEntity<?> getCandidateResult(
            @PathVariable Long assessmentId,
            @PathVariable Long invitationId,
            @RequestParam Long userId) {

        AssessmentHostResultDetailResponse result =
                resultService.getCandidateResult(
                        userId,
                        assessmentId,
                        invitationId
                );

        return ResponseEntity.ok(result);
    }
}