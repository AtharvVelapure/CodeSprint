package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentCodeResultResponse {

    private boolean success;

    private String status;

    private Integer passedTestCases;

    private Integer failedTestCases;

    private Integer totalTestCases;

    private Double marksObtained;

    private Double totalMarks;

    private String message;

    public AssessmentCodeResultResponse() {
    }

    public AssessmentCodeResultResponse(
            boolean success,
            String status,
            Integer passedTestCases,
            Integer failedTestCases,
            Integer totalTestCases,
            Double marksObtained,
            Double totalMarks,
            String message) {

        this.success = success;
        this.status = status;
        this.passedTestCases = passedTestCases;
        this.failedTestCases = failedTestCases;
        this.totalTestCases = totalTestCases;
        this.marksObtained = marksObtained;
        this.totalMarks = totalMarks;
        this.message = message;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getPassedTestCases() {
        return passedTestCases;
    }

    public void setPassedTestCases(Integer passedTestCases) {
        this.passedTestCases = passedTestCases;
    }

    public Integer getFailedTestCases() {
        return failedTestCases;
    }

    public void setFailedTestCases(Integer failedTestCases) {
        this.failedTestCases = failedTestCases;
    }

    public Integer getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(Integer totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}