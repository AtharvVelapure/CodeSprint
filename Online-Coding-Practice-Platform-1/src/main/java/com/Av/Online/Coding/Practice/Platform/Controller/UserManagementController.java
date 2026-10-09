package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.UserManagementService;
import com.Av.Online.Coding.Practice.Platform.dto.UserResponse;

@RestController
@RequestMapping("/api/admin/users")
public class UserManagementController {

    private final UserManagementService userManagementService;

    public UserManagementController(
            UserManagementService userManagementService) {

        this.userManagementService = userManagementService;
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(
                userManagementService.getAllUsers()
        );
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserResponse>> getActiveUsers() {

        return ResponseEntity.ok(
                userManagementService.getActiveUsers()
        );
    }


    @GetMapping("/blocked")
    public ResponseEntity<List<UserResponse>> getBlockedUsers() {

        return ResponseEntity.ok(
                userManagementService.getBlockedUsers()
        );
    }

    @PostMapping("/{id}/block")
    public ResponseEntity<String> blockUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userManagementService.blockUser(id)
        );
    }

    @PostMapping("/{id}/unblock")
    public ResponseEntity<String> unblockUser(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                userManagementService.unblockUser(id)
        );
    }
}