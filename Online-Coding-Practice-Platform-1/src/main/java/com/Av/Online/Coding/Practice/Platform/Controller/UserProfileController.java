package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.AuthService;
import com.Av.Online.Coding.Practice.Platform.dto.UserProfileRequest;
import com.Av.Online.Coding.Practice.Platform.dto.UserResponse;

@RestController
@RequestMapping("/api/users")
public class UserProfileController {

    private final AuthService authService;

    public UserProfileController(
            AuthService authService) {

        this.authService = authService;
    }


    // ========================================
    // GET USER PROFILE
    // ========================================

    @GetMapping("/{userId}/profile")
    public ResponseEntity<?> getUserProfile(
            @PathVariable Long userId) {

        UserResponse response =
                authService.getUserProfile(userId);

        if (response == null) {

            return ResponseEntity
                    .notFound()
                    .build();
        }

        return ResponseEntity.ok(response);
    }


    // ========================================
    // UPDATE USER PROFILE
    // ========================================

    @PutMapping("/{userId}/profile")
    public ResponseEntity<String> updateUserProfile(
            @PathVariable Long userId,
            @RequestBody UserProfileRequest request) {

        String response =
                authService.updateUserProfile(
                        userId,
                        request
                );

        return ResponseEntity.ok(response);
    }
}