package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.AdminCodeSpiritAIService;
import com.Av.Online.Coding.Practice.Platform.dto.AIChatRequest;
import com.Av.Online.Coding.Practice.Platform.dto.AIChatResponse;

@RestController
@RequestMapping("/api/admin/ai")
public class AdminAIChatController {

    private final AdminCodeSpiritAIService adminCodeSpiritAIService;

    public AdminAIChatController(
            AdminCodeSpiritAIService adminCodeSpiritAIService) {

        this.adminCodeSpiritAIService =
                adminCodeSpiritAIService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(
            @RequestBody AIChatRequest request) {

        if (request.getMessage() == null
                || request.getMessage().trim().isEmpty()) {

            return ResponseEntity
                    .badRequest()
                    .body(
                            new AIChatResponse(
                                    "Please enter a message."
                            )
                    );
        }

        return ResponseEntity.ok(
                adminCodeSpiritAIService.chat(
                        request.getMessage().trim()
                )
        );
    }
}