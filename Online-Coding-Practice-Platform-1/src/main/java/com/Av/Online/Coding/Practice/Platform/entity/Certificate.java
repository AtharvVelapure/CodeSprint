package com.Av.Online.Coding.Practice.Platform.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
        name = "certificates",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_certificate_number",
                        columnNames = {
                                "certificate_number"
                        }
                ),
                @UniqueConstraint(
                        name = "uk_certificate_user_certification",
                        columnNames = {
                                "user_id",
                                "certification_id"
                        }
                )
        }
)
public class Certificate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
            name = "certificate_number",
            nullable = false,
            unique = true
    )
    private String certificateNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "certification_id",
            nullable = false
    )
    private Certification certification;

    /*
     * The attempt on which the user first earned
     * this certification.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "attempt_id",
            nullable = false,
            unique = true
    )
    private CertificationAttempt attempt;

    @Column(nullable = false)
    private String certificateType;

    @Column(nullable = false)
    private Integer score;

    @Column(nullable = false)
    private Double percentage;

    @Column(nullable = false)
    private LocalDateTime issuedAt;

    @Column(nullable = false)
    private Boolean verified = true;

    public Certificate() {
    }

    public Certificate(
            String certificateNumber,
            User user,
            Certification certification,
            CertificationAttempt attempt,
            String certificateType,
            Integer score,
            Double percentage,
            LocalDateTime issuedAt,
            Boolean verified) {

        this.certificateNumber = certificateNumber;
        this.user = user;
        this.certification = certification;
        this.attempt = attempt;
        this.certificateType = certificateType;
        this.score = score;
        this.percentage = percentage;
        this.issuedAt = issuedAt;
        this.verified = verified;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCertificateNumber() {
        return certificateNumber;
    }

    public void setCertificateNumber(
            String certificateNumber) {

        this.certificateNumber =
                certificateNumber;
    }

    public User getUser() {
        return user;
    }

    public void setUser(
            User user) {

        this.user = user;
    }

    public Certification getCertification() {
        return certification;
    }

    public void setCertification(
            Certification certification) {

        this.certification =
                certification;
    }

    public CertificationAttempt getAttempt() {
        return attempt;
    }

    public void setAttempt(
            CertificationAttempt attempt) {

        this.attempt = attempt;
    }

    public String getCertificateType() {
        return certificateType;
    }

    public void setCertificateType(
            String certificateType) {

        this.certificateType =
                certificateType;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(
            Integer score) {

        this.score = score;
    }

    public Double getPercentage() {
        return percentage;
    }

    public void setPercentage(
            Double percentage) {

        this.percentage = percentage;
    }

    public LocalDateTime getIssuedAt() {
        return issuedAt;
    }

    public void setIssuedAt(
            LocalDateTime issuedAt) {

        this.issuedAt = issuedAt;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(
            Boolean verified) {

        this.verified = verified;
    }
}