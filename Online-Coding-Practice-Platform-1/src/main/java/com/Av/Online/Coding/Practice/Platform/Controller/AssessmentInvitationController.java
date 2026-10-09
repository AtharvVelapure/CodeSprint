package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentInvitationService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateUserResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentInvitationResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

@RestController
@RequestMapping("/api/assessment-invitations")
public class AssessmentInvitationController {

    private final AssessmentInvitationService invitationService;

    public AssessmentInvitationController(
            AssessmentInvitationService invitationService) {
        this.invitationService = invitationService;
    }

    @GetMapping("/{assessmentId}/users")
    public ResponseEntity<?> searchUsers(
            @PathVariable Long assessmentId,
            @RequestParam Long userId,
            @RequestParam(required = false) String search) {

        List<AssessmentCandidateUserResponse> users =
                invitationService.searchUsers(userId, assessmentId, search);

        return ResponseEntity.ok(users);
    }

    @PostMapping("/{assessmentId}/users/{candidateUserId}")
    public ResponseEntity<?> inviteExistingUser(
            @PathVariable Long assessmentId,
            @PathVariable Long candidateUserId,
            @RequestParam Long userId) {

        AssessmentInvitation invitation =
                invitationService.inviteUser(
                        userId,
                        assessmentId,
                        candidateUserId
                );

        return ResponseEntity.ok(
                new AssessmentInvitationResponse(invitation)
        );
    }

    @PostMapping("/{assessmentId}/external")
    public ResponseEntity<?> inviteExternalCandidate(
            @PathVariable Long assessmentId,
            @RequestParam Long userId,
            @RequestParam String candidateEmail) {

        AssessmentInvitation invitation =
                invitationService.inviteExternalCandidate(
                        userId,
                        assessmentId,
                        candidateEmail
                );

        return ResponseEntity.ok(
                new AssessmentInvitationResponse(invitation)
        );
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<?> getAssessmentInvitations(
            @PathVariable Long assessmentId,
            @RequestParam Long userId) {

        List<AssessmentInvitation> invitations =
                invitationService.getAssessmentInvitations(
                        userId,
                        assessmentId
                );

        List<AssessmentInvitationResponse> response =
                invitations.stream()
                        .map(AssessmentInvitationResponse::new)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }
}
