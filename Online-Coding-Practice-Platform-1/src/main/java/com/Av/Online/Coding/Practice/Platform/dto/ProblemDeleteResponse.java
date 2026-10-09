package com.Av.Online.Coding.Practice.Platform.dto;

public class ProblemDeleteResponse {

    private boolean deleted;
    private boolean requiresDeactivation;
    private String message;

    public ProblemDeleteResponse() {
    }

    public ProblemDeleteResponse(
            boolean deleted,
            boolean requiresDeactivation,
            String message) {

        this.deleted = deleted;
        this.requiresDeactivation = requiresDeactivation;
        this.message = message;
    }

    public boolean isDeleted() {
        return deleted;
    }

    public void setDeleted(boolean deleted) {
        this.deleted = deleted;
    }

    public boolean isRequiresDeactivation() {
        return requiresDeactivation;
    }

    public void setRequiresDeactivation(
            boolean requiresDeactivation) {

        this.requiresDeactivation =
                requiresDeactivation;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}