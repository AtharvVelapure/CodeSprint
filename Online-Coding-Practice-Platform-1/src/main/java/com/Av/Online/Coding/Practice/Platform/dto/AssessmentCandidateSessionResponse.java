package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;

public class AssessmentCandidateSessionResponse {

    private Long sessionId;

    private Long assessmentId;

    private String companyName;

    private String position;

    private String candidateName;

    private String candidateEmail;

    private LocalDateTime startedAt;

    private LocalDateTime expiresAt;

    private String status;

    private Integer warningCount;

    private Boolean cameraRequired;

    private Boolean microphoneRequired;

    private Boolean fullscreenRequired;

    private Integer warningLimit;

    public AssessmentCandidateSessionResponse(
            AssessmentCandidateSession session) {

        this.sessionId = session.getId();

        this.assessmentId =
                session.getInvitation()
                        .getAssessment()
                        .getId();

        this.companyName =
                session.getInvitation()
                        .getAssessment()
                        .getCompanyName();

        this.position =
                session.getInvitation()
                        .getAssessment()
                        .getPosition();

        this.candidateName =
                session.getInvitation()
                        .getCandidateName();

        this.candidateEmail =
                session.getInvitation()
                        .getCandidateEmail();

        this.startedAt =
                session.getStartedAt();

        this.expiresAt =
                session.getExpiresAt();

        this.status =
                session.getStatus();

        this.warningCount =
                session.getWarningCount();

        this.cameraRequired =
                session.getInvitation()
                        .getAssessment()
                        .getCameraRequired();

        this.microphoneRequired =
                session.getInvitation()
                        .getAssessment()
                        .getMicrophoneRequired();

        this.fullscreenRequired =
                session.getInvitation()
                        .getAssessment()
                        .getFullscreenRequired();

        this.warningLimit =
                session.getInvitation()
                        .getAssessment()
                        .getWarningLimit();
    }

    public Long getSessionId() {
        return sessionId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getPosition() {
        return position;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public String getStatus() {
        return status;
    }

    public Integer getWarningCount() {
        return warningCount;
    }

    public Boolean getCameraRequired() {
        return cameraRequired;
    }

    public Boolean getMicrophoneRequired() {
        return microphoneRequired;
    }

    public Boolean getFullscreenRequired() {
        return fullscreenRequired;
    }

    public Integer getWarningLimit() {
        return warningLimit;
    }
}