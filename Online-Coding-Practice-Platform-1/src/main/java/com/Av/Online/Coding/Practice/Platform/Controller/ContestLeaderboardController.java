package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.ContestLeaderboardService;
import com.Av.Online.Coding.Practice.Platform.dto.ContestLeaderboardResponse;

@RestController
@RequestMapping("/api/contests")
public class ContestLeaderboardController {

    private final ContestLeaderboardService contestLeaderboardService;

    public ContestLeaderboardController(
            ContestLeaderboardService contestLeaderboardService) {

        this.contestLeaderboardService = contestLeaderboardService;
    }

    @GetMapping("/{contestId}/leaderboard")
    public ResponseEntity<List<ContestLeaderboardResponse>>
    getContestLeaderboard(
            @PathVariable Long contestId) {

        return ResponseEntity.ok(
                contestLeaderboardService
                        .getContestLeaderboard(contestId)
        );
    }

    @GetMapping("/{contestId}/leaderboard/user/{userId}")
    public ResponseEntity<ContestLeaderboardResponse>
    getUserContestLeaderboard(
            @PathVariable Long contestId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                contestLeaderboardService
                        .getUserContestLeaderboard(
                                contestId,
                                userId
                        )
        );
    }
}