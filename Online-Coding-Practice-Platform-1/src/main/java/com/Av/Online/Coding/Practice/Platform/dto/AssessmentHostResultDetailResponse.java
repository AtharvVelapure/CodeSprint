package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;
import java.util.List;

public class AssessmentHostResultDetailResponse {

    private Long invitationId;

    private Long sessionId;

    private Long assessmentId;

    private String companyName;

    private String companyEmail;

    private String position;

    private String candidateName;

    private String candidateEmail;

    private String status;

    private Double totalMarks;

    private Double marksObtained;

    private Double percentage;

    private Integer totalQuestions;

    private Integer attemptedQuestions;

    private Integer solvedQuestions;

    private LocalDateTime invitedAt;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;

    private Integer warningCount;

    /*
     * =========================================================
     * ASSESSMENT SECURITY REQUIREMENTS
     * =========================================================
     *
     * These fields describe what the assessment required.
     *
     * cameraRequired       -> Assessment required camera
     * microphoneRequired   -> Assessment required microphone
     * fullscreenRequired   -> Assessment required fullscreen
     *
     * These are different from the "Active" fields below,
     * which describe the candidate session state.
     */

    private Boolean cameraRequired;

    private Boolean microphoneRequired;

    private Boolean fullscreenRequired;

    /*
     * =========================================================
     * CANDIDATE SESSION SECURITY STATE
     * =========================================================
     */

    private Boolean cameraActive;

    private Boolean microphoneActive;

    private Boolean fullscreenActive;

    private List<AssessmentHostQuestionResultResponse> questions;


    public AssessmentHostResultDetailResponse() {
    }


    public AssessmentHostResultDetailResponse(
            Long invitationId,
            Long sessionId,
            Long assessmentId,
            String companyName,
            String companyEmail,
            String position,
            String candidateName,
            String candidateEmail,
            String status,
            Double totalMarks,
            Double marksObtained,
            Double percentage,
            Integer totalQuestions,
            Integer attemptedQuestions,
            Integer solvedQuestions,
            LocalDateTime invitedAt,
            LocalDateTime startedAt,
            LocalDateTime submittedAt,
            Integer warningCount,
            Boolean cameraRequired,
            Boolean microphoneRequired,
            Boolean fullscreenRequired,
            Boolean cameraActive,
            Boolean microphoneActive,
            Boolean fullscreenActive,
            List<AssessmentHostQuestionResultResponse> questions) {

        this.invitationId = invitationId;
        this.sessionId = sessionId;
        this.assessmentId = assessmentId;
        this.companyName = companyName;
        this.companyEmail = companyEmail;
        this.position = position;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.status = status;
        this.totalMarks = totalMarks;
        this.marksObtained = marksObtained;
        this.percentage = percentage;
        this.totalQuestions = totalQuestions;
        this.attemptedQuestions = attemptedQuestions;
        this.solvedQuestions = solvedQuestions;
        this.invitedAt = invitedAt;
        this.startedAt = startedAt;
        this.submittedAt = submittedAt;
        this.warningCount = warningCount;

        this.cameraRequired = cameraRequired;
        this.microphoneRequired = microphoneRequired;
        this.fullscreenRequired = fullscreenRequired;

        this.cameraActive = cameraActive;
        this.microphoneActive = microphoneActive;
        this.fullscreenActive = fullscreenActive;

        this.questions = questions;
    }


    public Long getInvitationId() {
        return invitationId;
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


    public String getCompanyEmail() {
        return companyEmail;
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


    public String getStatus() {
        return status;
    }


    public Double getTotalMarks() {
        return totalMarks;
    }


    public Double getMarksObtained() {
        return marksObtained;
    }


    public Double getPercentage() {
        return percentage;
    }


    public Integer getTotalQuestions() {
        return totalQuestions;
    }


    public Integer getAttemptedQuestions() {
        return attemptedQuestions;
    }


    public Integer getSolvedQuestions() {
        return solvedQuestions;
    }


    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }


    public LocalDateTime getStartedAt() {
        return startedAt;
    }


    public LocalDateTime getSubmittedAt() {
        return submittedAt;
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


    public Boolean getCameraActive() {
        return cameraActive;
    }


    public Boolean getMicrophoneActive() {
        return microphoneActive;
    }


    public Boolean getFullscreenActive() {
        return fullscreenActive;
    }


    public List<AssessmentHostQuestionResultResponse> getQuestions() {
        return questions;
    }
}