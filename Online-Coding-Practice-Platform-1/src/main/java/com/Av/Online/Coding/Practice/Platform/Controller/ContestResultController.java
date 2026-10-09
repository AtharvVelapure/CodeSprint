package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.ContestService;
import com.Av.Online.Coding.Practice.Platform.dto.MyContestResultResponse;

@RestController
@RequestMapping("/api/contests")
public class ContestResultController {

    private final ContestService contestService;

    public ContestResultController(
            ContestService contestService) {

        this.contestService = contestService;
    }

    // =========================================
    // GET MY CONTEST RESULTS
    // =========================================

    @GetMapping("/user/{userId}/results")
    public ResponseEntity<List<MyContestResultResponse>>
    getMyContestResults(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                contestService.getMyContestResults(userId)
        );
    }
}