package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

public class AssessmentHostResultSummaryResponse {

    private Long invitationId;

    private Long sessionId;

    private Long assessmentId;

    private String candidateName;

    private String candidateEmail;

    private String status;

    private Double marksObtained;

    private Double totalMarks;

    private Double percentage;

    private Integer totalQuestions;

    private Integer attemptedQuestions;

    private Integer solvedQuestions;

    private LocalDateTime invitedAt;

    private LocalDateTime startedAt;

    private LocalDateTime submittedAt;


    public AssessmentHostResultSummaryResponse() {
    }


    public AssessmentHostResultSummaryResponse(
            Long invitationId,
            Long sessionId,
            Long assessmentId,
            String candidateName,
            String candidateEmail,
            String status,
            Double marksObtained,
            Double totalMarks,
            Double percentage,
            Integer totalQuestions,
            Integer attemptedQuestions,
            Integer solvedQuestions,
            LocalDateTime invitedAt,
            LocalDateTime startedAt,
            LocalDateTime submittedAt) {

        this.invitationId = invitationId;
        this.sessionId = sessionId;
        this.assessmentId = assessmentId;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.status = status;
        this.marksObtained = marksObtained;
        this.totalMarks = totalMarks;
        this.percentage = percentage;
        this.totalQuestions = totalQuestions;
        this.attemptedQuestions = attemptedQuestions;
        this.solvedQuestions = solvedQuestions;
        this.invitedAt = invitedAt;
        this.startedAt = startedAt;
        this.submittedAt = submittedAt;
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

    public String getCandidateName() {
        return candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public String getStatus() {
        return status;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public Double getTotalMarks() {
        return totalMarks;
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
}