package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.CodeSpiritAIStatsService;
import com.Av.Online.Coding.Practice.Platform.dto.AIUserStatsResponse;

@RestController
@RequestMapping("/api/ai")
public class AIStatsController {

    private final CodeSpiritAIStatsService statsService;

    public AIStatsController(
            CodeSpiritAIStatsService statsService) {

        this.statsService = statsService;
    }

    @GetMapping("/my-stats/{userId}")
    public ResponseEntity<AIUserStatsResponse> getMyStats(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                statsService.getUserStats(userId)
        );
    }
}