package com.Av.Online.Coding.Practice.Platform.dto;


public class CertificationAttemptResponse {

    private Long id;

    private Long certificationId;
    private String certificationTitle;

    private Long userId;
    private String userName;

    private Integer totalQuestions;
    private Integer correctAnswers;
    private Integer score;

    private Double percentage;

    private Boolean passed;

    private String status;

    private String startedAt;
    private String submittedAt;

    private Long certificateId;
    private String certificateNumber;

    public CertificationAttemptResponse() {
    }

    public CertificationAttemptResponse(
            Long id,
            Long certificationId,
            String certificationTitle,
            Long userId,
            String userName,
            Integer totalQuestions,
            Integer correctAnswers,
            Integer score,
            Double percentage,
            Boolean passed,
            String status,
            String startedAt,
            String submittedAt,
            Long certificateId,
            String certificateNumber) {

        this.id = id;
        this.certificationId = certificationId;
        this.certificationTitle = certificationTitle;
        this.userId = userId;
        this.userName = userName;
        this.totalQuestions = totalQuestions;
        this.correctAnswers = correctAnswers;
        this.score = score;
        this.percentage = percentage;
        this.passed = passed;
        this.status = status;
        this.startedAt = startedAt;
        this.submittedAt = submittedAt;
        this.certificateId = certificateId;
        this.certificateNumber = certificateNumber;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getCorrectAnswers() {
        return correctAnswers;
    }

    public void setCorrectAnswers(Integer correctAnswers) {
        this.correctAnswers = correctAnswers;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(Double percentage) {
        this.percentage = percentage;
    }

    public Boolean getPassed() {
        return passed;
    }

    public void setPassed(Boolean passed) {
        this.passed = passed;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(String startedAt) {
        this.startedAt = startedAt;
    }

    public String getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(String submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Long getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(Long certificateId) {
        this.certificateId = certificateId;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(String certificateNumber) {
        this.certificateNumber = certificateNumber;
    }
}