package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentCandidateService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateInfoResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateProblemResponse;

@RestController
@RequestMapping("/api/assessment-candidates")
public class AssessmentCandidateController {

    private final AssessmentCandidateService candidateService;

    public AssessmentCandidateController(
            AssessmentCandidateService candidateService) {

        this.candidateService = candidateService;
    }

    @GetMapping("/{invitationToken}")
    public ResponseEntity<?> getCandidateInfo(
            @PathVariable String invitationToken) {

        AssessmentCandidateInfoResponse response =
                candidateService.getCandidateInfo(
                        invitationToken
                );

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{invitationToken}/problems")
    public ResponseEntity<?> getAssessmentProblems(
            @PathVariable String invitationToken) {

        List<AssessmentCandidateProblemResponse> response =
                candidateService.getAssessmentProblems(
                        invitationToken
                );

        return ResponseEntity.ok(response);
    }
}
