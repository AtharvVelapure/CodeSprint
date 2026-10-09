package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.CodeSpiritAIService;
import com.Av.Online.Coding.Practice.Platform.dto.AIChatRequest;
import com.Av.Online.Coding.Practice.Platform.dto.AIChatResponse;
import com.Av.Online.Coding.Practice.Platform.security.AuthenticatedUserService;

@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private final CodeSpiritAIService codeSpiritAIService;
    private final AuthenticatedUserService authenticatedUserService;

    public AIChatController(
            CodeSpiritAIService codeSpiritAIService,
            AuthenticatedUserService authenticatedUserService) {

        this.codeSpiritAIService = codeSpiritAIService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @PostMapping("/chat")
    public ResponseEntity<AIChatResponse> chat(
            @RequestBody AIChatRequest request) {

        if (request.getMessage() == null ||
                request.getMessage().trim().isEmpty()) {

            return ResponseEntity.badRequest()
                    .body(
                        new AIChatResponse(
                            "Please enter a message."
                        )
                    );
        }

        return ResponseEntity.ok(
                codeSpiritAIService.chat(
                        request.getMessage().trim(),
                        authenticatedUserService.currentUserId()
                )
        );
    }
}