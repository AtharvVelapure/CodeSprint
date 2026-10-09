package com.Av.Online.Coding.Practice.Platform.dto;

public class ContestProblemResultResponse {

    private Long problemId;

    private String problemTitle;

    private Integer problemOrder;

    private Integer points;

    private boolean solved;

    private Integer submissionCount;

    private String status;

    private String submittedAt;

    private String timeTaken;


    // =========================================
    // CONSTRUCTOR
    // =========================================

    public ContestProblemResultResponse(
            Long problemId,
            String problemTitle,
            Integer problemOrder,
            Integer points,
            boolean solved,
            Integer submissionCount,
            String status,
            String submittedAt,
            String timeTaken) {

        this.problemId = problemId;
        this.problemTitle = problemTitle;
        this.problemOrder = problemOrder;
        this.points = points;
        this.solved = solved;
        this.submissionCount = submissionCount;
        this.status = status;
        this.submittedAt = submittedAt;
        this.timeTaken = timeTaken;
    }


    // =========================================
    // GETTERS
    // =========================================

    public Long getProblemId() {
        return problemId;
    }

    public String getProblemTitle() {
        return problemTitle;
    }

    public Integer getProblemOrder() {
        return problemOrder;
    }

    public Integer getPoints() {
        return points;
    }

    public boolean isSolved() {
        return solved;
    }

    public Integer getSubmissionCount() {
        return submissionCount;
    }

    public String getStatus() {
        return status;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public String getTimeTaken() {
        return timeTaken;
    }


    // =========================================
    // SETTERS
    // =========================================

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public void setProblemTitle(String problemTitle) {
        this.problemTitle = problemTitle;
    }

    public void setProblemOrder(Integer problemOrder) {
        this.problemOrder = problemOrder;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }

    public void setSolved(boolean solved) {
        this.solved = solved;
    }

    public void setSubmissionCount(Integer submissionCount) {
        this.submissionCount = submissionCount;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }

    public void setTimeTaken(String timeTaken) {
        this.timeTaken = timeTaken;
    }
}