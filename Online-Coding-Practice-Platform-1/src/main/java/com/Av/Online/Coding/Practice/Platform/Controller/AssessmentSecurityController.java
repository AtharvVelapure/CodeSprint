package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentSecurityService;
import com.Av.Online.Coding.Practice.Platform.Service.AssessmentSecurityService.SecurityEventResult;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentSecurityEventRequest;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentSecurityEventResponse;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;

@RestController
@RequestMapping("/api/assessment/security")
public class AssessmentSecurityController {

    private final AssessmentSecurityService securityService;

    public AssessmentSecurityController(
            AssessmentSecurityService securityService) {

        this.securityService = securityService;
    }

    @PostMapping("/event")
    public ResponseEntity<AssessmentSecurityEventResponse>
            registerSecurityEvent(
                    @RequestBody
                    AssessmentSecurityEventRequest request) {

        if (request == null) {
            throw new BadRequestException(
                    "Security event request is required."
            );
        }

        SecurityEventResult result =
                securityService.registerSecurityEvent(
                        request.getInvitationToken(),
                        request.getEventType(),
                        request.getDetails()
                );

        AssessmentSecurityEventResponse response =
                new AssessmentSecurityEventResponse(
                        result.warningCount(),
                        result.warningLimit(),
                        result.autoSubmitted(),
                        result.message()
                );

        return ResponseEntity.ok(response);
    }
}
