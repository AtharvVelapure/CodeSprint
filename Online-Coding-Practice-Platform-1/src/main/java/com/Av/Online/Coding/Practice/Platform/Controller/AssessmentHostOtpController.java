package com.Av.Online.Coding.Practice.Platform.Controller;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentHostOtpService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/assessment-host/otp")
public class AssessmentHostOtpController {

    private final AssessmentHostOtpService otpService;

    public AssessmentHostOtpController(
            AssessmentHostOtpService otpService) {

        this.otpService = otpService;
    }

    // =====================================================
    // SEND OTP
    // =====================================================

    @PostMapping("/send")
    public ResponseEntity<Map<String, Object>> sendOtp(
            @RequestParam Long userId) {

        otpService.sendOtp(userId);

        Map<String, Object> response =
                new HashMap<>();

        response.put("success", true);
        response.put(
                "message",
                "OTP has been sent to your verified business email"
        );

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // VERIFY OTP
    // =====================================================

    @PostMapping("/verify")
    public ResponseEntity<Map<String, Object>> verifyOtp(
            @RequestParam Long userId,
            @RequestParam String otp) {

        boolean verified =
                otpService.verifyOtp(
                        userId,
                        otp
                );

        Map<String, Object> response =
                new HashMap<>();

        response.put("success", verified);
        response.put(
                "message",
                "OTP verified successfully"
        );

        return ResponseEntity.ok(response);
    }
}