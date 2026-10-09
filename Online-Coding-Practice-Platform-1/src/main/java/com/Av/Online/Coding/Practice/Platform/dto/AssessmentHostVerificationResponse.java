package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostVerification;

public class AssessmentHostVerificationResponse {

    private Long id;

    private Long userId;

    private String userName;

    private String userEmail;

    private String businessName;

    private String businessEmail;

    private String documentPath;

    private String status;

    private String adminRemarks;

    private LocalDateTime requestedAt;

    private LocalDateTime reviewedAt;

    private LocalDateTime verifiedAt;

    private Boolean otpVerified;

    public AssessmentHostVerificationResponse() {
    }

    public AssessmentHostVerificationResponse(
            AssessmentHostVerification verification) {

        this.id = verification.getId();

        if (verification.getUser() != null) {
            this.userId = verification.getUser().getId();
            this.userName = verification.getUser().getName();
            this.userEmail = verification.getUser().getEmail();
        }

        this.businessName = verification.getBusinessName();
        this.businessEmail = verification.getBusinessEmail();
        this.documentPath = verification.getDocumentPath();
        this.status = verification.getStatus();
        this.adminRemarks = verification.getAdminRemarks();
        this.requestedAt = verification.getRequestedAt();
        this.reviewedAt = verification.getReviewedAt();
        this.verifiedAt = verification.getVerifiedAt();

        this.otpVerified = verification.getOtpVerified();
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getUserName() {
        return userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public String getBusinessName() {
        return businessName;
    }

    public String getBusinessEmail() {
        return businessEmail;
    }

    public String getDocumentPath() {
        return documentPath;
    }

    public String getStatus() {
        return status;
    }

    public String getAdminRemarks() {
        return adminRemarks;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public LocalDateTime getReviewedAt() {
        return reviewedAt;
    }

    public LocalDateTime getVerifiedAt() {
        return verifiedAt;
    }

    public Boolean getOtpVerified() {
        return otpVerified;
    }

    public void setOtpVerified(Boolean otpVerified) {
        this.otpVerified = otpVerified;
    }
}