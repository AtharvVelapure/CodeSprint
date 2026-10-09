package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

public class AssessmentCandidateFeedbackResponse {

    private Long feedbackId;

    private Long sessionId;

    private Integer overallRating;

    private Integer questionQualityRating;

    private Integer platformRating;

    private String difficulty;

    private Boolean technicalIssue;

    private String comments;

    private LocalDateTime submittedAt;

    public AssessmentCandidateFeedbackResponse() {
    }

    public AssessmentCandidateFeedbackResponse(
            Long feedbackId,
            Long sessionId,
            Integer overallRating,
            Integer questionQualityRating,
            Integer platformRating,
            String difficulty,
            Boolean technicalIssue,
            String comments,
            LocalDateTime submittedAt
    ) {

        this.feedbackId = feedbackId;
        this.sessionId = sessionId;
        this.overallRating = overallRating;
        this.questionQualityRating =
                questionQualityRating;
        this.platformRating = platformRating;
        this.difficulty = difficulty;
        this.technicalIssue = technicalIssue;
        this.comments = comments;
        this.submittedAt = submittedAt;
    }

    public Long getFeedbackId() {
        return feedbackId;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public Integer getQuestionQualityRating() {
        return questionQualityRating;
    }

    public Integer getPlatformRating() {
        return platformRating;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public Boolean getTechnicalIssue() {
        return technicalIssue;
    }

    public String getComments() {
        return comments;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }
}