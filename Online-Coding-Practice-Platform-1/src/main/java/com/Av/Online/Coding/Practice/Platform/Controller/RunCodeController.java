
package com.Av.Online.Coding.Practice.Platform.Controller;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.Av.Online.Coding.Practice.Platform.Service.RunCodeService;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeRequest;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.security.AuthenticatedUserService;
import com.Av.Online.Coding.Practice.Platform.security.CodeExecutionRateLimiter;

@RestController
@RequestMapping("/api/code")
public class RunCodeController {

    private final RunCodeService runCodeService;
    private final AuthenticatedUserService authenticatedUserService;
    private final CodeExecutionRateLimiter rateLimiter;

    public RunCodeController(
            RunCodeService runCodeService,
            AuthenticatedUserService authenticatedUserService,
            CodeExecutionRateLimiter rateLimiter) {

        this.runCodeService = runCodeService;
        this.authenticatedUserService = authenticatedUserService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/run")
    public ResponseEntity<RunCodeResponse> runCode(
            @Valid @RequestBody RunCodeRequest request) {

        Long userId = authenticatedUserService.currentUserId();

        if (!rateLimiter.allowRequest(
                userId,
                "run",
                10,
                Duration.ofMinutes(1))) {

            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new RunCodeResponse(
                            false,
                            "Rate Limit Exceeded",
                            null,
                            "You can run code up to 10 times per minute. Please try again later."
                    ));
        }

        request.setUserId(userId);

        RunCodeResponse response =
                runCodeService.runCode(request);

        return ResponseEntity.ok(response);
    }
}
