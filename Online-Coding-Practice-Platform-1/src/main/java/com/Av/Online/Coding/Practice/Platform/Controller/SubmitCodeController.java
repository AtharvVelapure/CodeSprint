
package com.Av.Online.Coding.Practice.Platform.Controller;

import java.time.Duration;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.validation.Valid;

import com.Av.Online.Coding.Practice.Platform.Service.SubmitCodeService;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeRequest;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.security.AuthenticatedUserService;
import com.Av.Online.Coding.Practice.Platform.security.CodeExecutionRateLimiter;

@RestController
@RequestMapping("/api/code")
public class SubmitCodeController {

    private final SubmitCodeService submitCodeService;
    private final AuthenticatedUserService authenticatedUserService;
    private final CodeExecutionRateLimiter rateLimiter;

    public SubmitCodeController(
            SubmitCodeService submitCodeService,
            AuthenticatedUserService authenticatedUserService,
            CodeExecutionRateLimiter rateLimiter) {

        this.submitCodeService = submitCodeService;
        this.authenticatedUserService = authenticatedUserService;
        this.rateLimiter = rateLimiter;
    }

    @PostMapping("/submit")
    public ResponseEntity<RunCodeResponse> submitCode(
            @Valid @RequestBody RunCodeRequest request) {

        Long userId = authenticatedUserService.currentUserId();

        if (!rateLimiter.allowRequest(
                userId,
                "submit",
                5,
                Duration.ofMinutes(1))) {

            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new RunCodeResponse(
                            false,
                            "Rate Limit Exceeded",
                            null,
                            "You can submit code up to 5 times per minute. Please try again later."
                    ));
        }

        request.setUserId(userId);

        return ResponseEntity.ok(
                submitCodeService.submitCode(request)
        );
    }
}
