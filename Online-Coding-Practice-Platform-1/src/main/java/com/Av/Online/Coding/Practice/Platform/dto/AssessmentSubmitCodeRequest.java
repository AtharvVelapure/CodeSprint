package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentSubmitCodeRequest {

    private Long assignmentProblemId;
    private String language;
    private String code;

    public AssessmentSubmitCodeRequest() {
    }

    public Long getAssignmentProblemId() {
        return assignmentProblemId;
    }

    public void setAssignmentProblemId(Long assignmentProblemId) {
        this.assignmentProblemId = assignmentProblemId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}