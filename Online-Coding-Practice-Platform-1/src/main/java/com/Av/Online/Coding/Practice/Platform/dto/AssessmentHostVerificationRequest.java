package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentHostVerificationRequest {

    private Long userId;
    private String businessName;
    private String businessEmail;

    public AssessmentHostVerificationRequest() {
    }

    public AssessmentHostVerificationRequest(
            Long userId,
            String businessName,
            String businessEmail) {

        this.userId = userId;
        this.businessName = businessName;
        this.businessEmail = businessEmail;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getBusinessName() {
        return businessName;
    }

    public void setBusinessName(String businessName) {
        this.businessName = businessName;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public void setBusinessEmail(String businessEmail) {
        this.businessEmail = businessEmail;
    }
}