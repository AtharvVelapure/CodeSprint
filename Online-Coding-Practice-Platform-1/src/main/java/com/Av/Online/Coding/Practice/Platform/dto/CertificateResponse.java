package com.Av.Online.Coding.Practice.Platform.dto;

public class CertificateResponse {

    private Long id;
    private String certificateNumber;
    private Long userId;
    private String userName;
    private Long certificationId;
    private String certificationTitle;
    private Long attemptId;
    private String certificateType;
    private Integer score;
    private Double percentage;
    private String issuedAt;
    private Boolean verified;

    public CertificateResponse() {
    }

    public CertificateResponse(Long id, String certificateNumber, Long userId,
                               String userName, Long certificationId,
                               String certificationTitle, Long attemptId,
                               String certificateType, Integer score,
                               Double percentage, String issuedAt,
                               Boolean verified) {
        this.id = id;
        this.certificateNumber = certificateNumber;
        this.userId = userId;
        this.userName = userName;
        this.certificationId = certificationId;
        this.certificationTitle = certificationTitle;
        this.attemptId = attemptId;
        this.certificateType = certificateType;
        this.score = score;
        this.percentage = percentage;
        this.issuedAt = issuedAt;
        this.verified = verified;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCertificateNumber() { return certificateNumber; }
    public void setCertificateNumber(String certificateNumber) { this.certificateNumber = certificateNumber; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public Long getCertificationId() { return certificationId; }
    public void setCertificationId(Long certificationId) { this.certificationId = certificationId; }

    public String getCertificationTitle() { return certificationTitle; }
    public void setCertificationTitle(String certificationTitle) { this.certificationTitle = certificationTitle; }

    public Long getAttemptId() { return attemptId; }
    public void setAttemptId(Long attemptId) { this.attemptId = attemptId; }

    public String getCertificateType() { return certificateType; }
    public void setCertificateType(String certificateType) { this.certificateType = certificateType; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    public String getIssuedAt() { return issuedAt; }
    public void setIssuedAt(String issuedAt) { this.issuedAt = issuedAt; }

    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }
}