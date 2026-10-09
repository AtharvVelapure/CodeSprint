package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.ContestService;
import com.Av.Online.Coding.Practice.Platform.dto.ContestProblemResultResponse;

@RestController
@RequestMapping("/api/contests")
public class ContestProblemResultController {

    private final ContestService contestService;

    public ContestProblemResultController(
            ContestService contestService) {

        this.contestService = contestService;
    }


    // =========================================
    // GET USER'S PROBLEM-WISE CONTEST RESULTS
    // =========================================

    @GetMapping("/{contestId}/user/{userId}/problem-results")
    public ResponseEntity<List<ContestProblemResultResponse>>
    getContestProblemResults(
            @PathVariable Long contestId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                contestService.getContestProblemResults(
                        contestId,
                        userId
                )
        );
    }
}