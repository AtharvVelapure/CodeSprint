package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentSecurityEventResponse {

    private int warningCount;
    private int warningLimit;
    private boolean autoSubmitted;
    private String message;

    public AssessmentSecurityEventResponse() {
    }

    public AssessmentSecurityEventResponse(
            int warningCount,
            int warningLimit,
            boolean autoSubmitted,
            String message) {

        this.warningCount = warningCount;
        this.warningLimit = warningLimit;
        this.autoSubmitted = autoSubmitted;
        this.message = message;
    }

    public int getWarningCount() {
        return warningCount;
    }

    public void setWarningCount(int warningCount) {
        this.warningCount = warningCount;
    }

    public int getWarningLimit() {
        return warningLimit;
    }

    public void setWarningLimit(int warningLimit) {
        this.warningLimit = warningLimit;
    }

    public boolean isAutoSubmitted() {
        return autoSubmitted;
    }

    public void setAutoSubmitted(boolean autoSubmitted) {
        this.autoSubmitted = autoSubmitted;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
