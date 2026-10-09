package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

public class AssessmentInvitationResponse {

    private Long id;

    private Long assessmentId;

    private Long candidateUserId;

    private String candidateEmail;

    private String candidateName;

    private String invitationToken;

    private String status;

    private LocalDateTime invitedAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    // =====================================================
    // CONSTRUCTORS
    // =====================================================

    public AssessmentInvitationResponse() {
    }

    public AssessmentInvitationResponse(
            AssessmentInvitation invitation) {

        this.id = invitation.getId();

        // =================================================
        // ASSESSMENT
        // =================================================

        if (invitation.getAssessment() != null) {

            this.assessmentId =
                    invitation.getAssessment().getId();
        }

        // =================================================
        // CANDIDATE USER
        // =================================================

        if (invitation.getCandidateUser() != null) {

            this.candidateUserId =
                    invitation.getCandidateUser().getId();
        }

        // =================================================
        // CANDIDATE INFORMATION
        // =================================================

        this.candidateEmail =
                invitation.getCandidateEmail();

        this.candidateName =
                invitation.getCandidateName();

        // =================================================
        // INVITATION
        // =================================================

        this.invitationToken =
                invitation.getInvitationToken();

        this.status =
                invitation.getStatus();

        this.invitedAt =
                invitation.getInvitedAt();

        this.startedAt =
                invitation.getStartedAt();

        this.completedAt =
                invitation.getCompletedAt();
    }

    // =====================================================
    // GETTERS / SETTERS
    // =====================================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public Long getCandidateUserId() {
        return candidateUserId;
    }

    public void setCandidateUserId(Long candidateUserId) {
        this.candidateUserId = candidateUserId;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public String getInvitationToken() {
        return invitationToken;
    }

    public void setInvitationToken(String invitationToken) {
        this.invitationToken = invitationToken;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}