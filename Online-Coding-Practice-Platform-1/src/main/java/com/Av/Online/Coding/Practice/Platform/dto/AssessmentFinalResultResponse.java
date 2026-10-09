package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentFinalResultResponse {

    private Long sessionId;
    private Long assessmentId;
    private String status;

    private Double totalMarks;
    private Double marksObtained;
    private Double percentage;

    private Integer totalQuestions;
    private Integer attemptedQuestions;
    private Integer solvedQuestions;

    public AssessmentFinalResultResponse() {
    }

    public AssessmentFinalResultResponse(
            Long sessionId,
            Long assessmentId,
            String status,
            Double totalMarks,
            Double marksObtained,
            Double percentage,
            Integer totalQuestions,
            Integer attemptedQuestions,
            Integer solvedQuestions) {

        this.sessionId = sessionId;
        this.assessmentId = assessmentId;
        this.status = status;
        this.totalMarks = totalMarks;
        this.marksObtained = marksObtained;
        this.percentage = percentage;
        this.totalQuestions = totalQuestions;
        this.attemptedQuestions = attemptedQuestions;
        this.solvedQuestions = solvedQuestions;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getAttemptedQuestions() {
        return attemptedQuestions;
    }

    public void setAttemptedQuestions(Integer attemptedQuestions) {
        this.attemptedQuestions = attemptedQuestions;
    }

    public Integer getSolvedQuestions() {
        return solvedQuestions;
    }

    public void setSolvedQuestions(Integer solvedQuestions) {
        this.solvedQuestions = solvedQuestions;
    }
}