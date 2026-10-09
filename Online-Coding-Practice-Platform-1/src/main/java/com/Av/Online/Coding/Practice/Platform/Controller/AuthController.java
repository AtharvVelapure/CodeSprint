package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AuthService;
import com.Av.Online.Coding.Practice.Platform.dto.LoginRequest;
import com.Av.Online.Coding.Practice.Platform.dto.RegisterRequest;
import com.Av.Online.Coding.Practice.Platform.dto.UserResponse;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }


    // ================================
    // REGISTER
    // ================================

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @RequestBody RegisterRequest request) {

        String response =
                authService.registerUser(request);

        return ResponseEntity.ok(response);
    }


    // ================================
    // LOGIN
    // USER + ADMIN
    // ================================

    @PostMapping("/login")
    public ResponseEntity<UserResponse> login(
            @RequestBody LoginRequest request) {

        UserResponse response =
                authService.loginUser(request);

        return ResponseEntity.ok(response);
    }
}