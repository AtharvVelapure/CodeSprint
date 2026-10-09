package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.LeaderboardService;
import com.Av.Online.Coding.Practice.Platform.dto.LeaderboardResponse;

@RestController
@RequestMapping("/api/leaderboards")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    public LeaderboardController(
            LeaderboardService leaderboardService) {

        this.leaderboardService =
                leaderboardService;
    }

    // ========================================
    // GLOBAL LEADERBOARD
    // ========================================

    @GetMapping
    public ResponseEntity<List<LeaderboardResponse>>
    getGlobalLeaderboard() {

        return ResponseEntity.ok(
                leaderboardService
                        .getGlobalLeaderboard()
        );
    }

    // ========================================
    // USER LEADERBOARD DATA
    // ========================================

    @GetMapping("/user/{userId}")
    public ResponseEntity<LeaderboardResponse>
    getUserLeaderboard(
            @PathVariable Long userId) {

        LeaderboardResponse response =
                leaderboardService
                        .getUserLeaderboard(userId);

        if (response == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(response);
    }
}