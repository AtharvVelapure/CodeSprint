package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.Service.ContestSubmissionService;
import com.Av.Online.Coding.Practice.Platform.dto.ContestSubmissionResponse;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;

@RestController
@RequestMapping("/api/contests")
public class ContestSubmissionController {

    private final ContestSubmissionService contestSubmissionService;
    private final SubmissionRepository submissionRepository;

    public ContestSubmissionController(
            ContestSubmissionService contestSubmissionService,
            SubmissionRepository submissionRepository) {

        this.contestSubmissionService = contestSubmissionService;
        this.submissionRepository = submissionRepository;
    }

    // =========================================================
    // RUN CONTEST CODE
    //
    // Does not save a submission and does not update score.
    // Contest/session validation is handled by the service.
    // =========================================================

    @PostMapping("/{contestId}/run")
    public ResponseEntity<RunCodeResponse> runContestCode(
            @PathVariable Long contestId,
            @RequestParam Long userId,
            @RequestParam Long problemId,
            @RequestParam String language,
            @RequestBody String code) {

        RunCodeResponse response =
                contestSubmissionService.runContestCode(
                        contestId,
                        userId,
                        problemId,
                        code,
                        language
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // SUBMIT CONTEST SOLUTION
    // =========================================================

    @PostMapping("/{contestId}/submit")
    public ResponseEntity<RunCodeResponse> submitContestSolution(
            @PathVariable Long contestId,
            @RequestParam Long userId,
            @RequestParam Long problemId,
            @RequestParam String language,
            @RequestBody String code) {

        RunCodeResponse response =
                contestSubmissionService.submitContestSolution(
                        contestId,
                        userId,
                        problemId,
                        code,
                        language
                );

        return ResponseEntity.ok(response);
    }

    // =========================================================
    // ALL CONTEST SUBMISSIONS
    // =========================================================

    @GetMapping("/{contestId}/submissions")
    public ResponseEntity<List<Submission>> getContestSubmissions(
            @PathVariable Long contestId) {

        List<Submission> submissions =
                submissionRepository.findByContestIdOrderBySubmittedAtDesc(
                        contestId
                );

        return ResponseEntity.ok(submissions);
    }

    // =========================================================
    // USER'S CONTEST SUBMISSIONS
    // =========================================================

    @GetMapping("/{contestId}/submissions/user/{userId}")
    public ResponseEntity<List<Submission>> getUserContestSubmissions(
            @PathVariable Long contestId,
            @PathVariable Long userId) {

        List<Submission> submissions =
                submissionRepository
                        .findByContestIdAndUserIdOrderBySubmittedAtDesc(
                                contestId,
                                userId
                        );

        return ResponseEntity.ok(submissions);
    }

    // =========================================================
    // PROBLEM-WISE USER CONTEST SUBMISSIONS
    // =========================================================

    @GetMapping("/{contestId}/user/{userId}/problem/{problemId}/submissions")
    public ResponseEntity<List<ContestSubmissionResponse>>
    getContestProblemSubmissions(
            @PathVariable Long contestId,
            @PathVariable Long userId,
            @PathVariable Long problemId) {

        return ResponseEntity.ok(
                contestSubmissionService.getContestProblemSubmissions(
                        contestId,
                        userId,
                        problemId
                )
        );
    }
}
