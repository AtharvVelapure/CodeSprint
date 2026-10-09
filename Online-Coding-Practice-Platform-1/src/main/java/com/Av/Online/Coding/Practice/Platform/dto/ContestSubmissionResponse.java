package com.Av.Online.Coding.Practice.Platform.dto;

public class ContestSubmissionResponse {

    private Long id;
    private Long problemId;
    private String problemTitle;
    private String code;
    private String language;
    private String status;
    private String submittedAt;

    public ContestSubmissionResponse(
            Long id,
            Long problemId,
            String problemTitle,
            String code,
            String language,
            String status,
            String submittedAt) {

        this.id = id;
        this.problemId = problemId;
        this.problemTitle = problemTitle;
        this.code = code;
        this.language = language;
        this.status = status;
        this.submittedAt = submittedAt;
    }

    public Long getId() {
        return id;
    }

    public Long getProblemId() {
        return problemId;
    }

    public String getProblemTitle() {
        return problemTitle;
    }

    public String getCode() {
        return code;
    }

    public String getLanguage() {
        return language;
    }

    public String getStatus() {
        return status;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public void setProblemTitle(String problemTitle) {
        this.problemTitle = problemTitle;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }
}