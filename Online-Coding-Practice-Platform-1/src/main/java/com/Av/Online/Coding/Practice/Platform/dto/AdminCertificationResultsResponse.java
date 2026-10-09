package com.Av.Online.Coding.Practice.Platform.dto;

import java.util.List;

public class AdminCertificationResultsResponse {

    private Long certificationId;
    private String certificationTitle;

    private Integer totalAttempts;
    private Integer uniqueCandidates;

    private Integer passedAttempts;
    private Integer failedAttempts;
    private Integer expiredAttempts;
    private Integer inProgressAttempts;

    private List<AdminCertificationAttemptResult> attempts;

    public AdminCertificationResultsResponse() {
    }

    public Long getCertificationId() {
        return certificationId;
    }

    public void setCertificationId(Long certificationId) {
        this.certificationId = certificationId;
    }

    public String getCertificationTitle() {
        return certificationTitle;
    }

    public void setCertificationTitle(String certificationTitle) {
        this.certificationTitle = certificationTitle;
    }

    public Integer getTotalAttempts() {
        return totalAttempts;
    }

    public void setTotalAttempts(Integer totalAttempts) {
        this.totalAttempts = totalAttempts;
    }

    public Integer getUniqueCandidates() {
        return uniqueCandidates;
    }

    public void setUniqueCandidates(Integer uniqueCandidates) {
        this.uniqueCandidates = uniqueCandidates;
    }

    public Integer getPassedAttempts() {
        return passedAttempts;
    }

    public void setPassedAttempts(Integer passedAttempts) {
        this.passedAttempts = passedAttempts;
    }

    public Integer getFailedAttempts() {
        return failedAttempts;
    }

    public void setFailedAttempts(Integer failedAttempts) {
        this.failedAttempts = failedAttempts;
    }

    public Integer getExpiredAttempts() {
        return expiredAttempts;
    }

    public void setExpiredAttempts(Integer expiredAttempts) {
        this.expiredAttempts = expiredAttempts;
    }

    public Integer getInProgressAttempts() {
        return inProgressAttempts;
    }

    public void setInProgressAttempts(Integer inProgressAttempts) {
        this.inProgressAttempts = inProgressAttempts;
    }

    public List<AdminCertificationAttemptResult> getAttempts() {
        return attempts;
    }

    public void setAttempts(
            List<AdminCertificationAttemptResult> attempts) {

        this.attempts = attempts;
    }
}