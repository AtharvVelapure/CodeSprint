package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "assessment_assignments")
public class AssessmentAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * User who created the assessment.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(nullable = false)
    private String companyName;

    @Column(nullable = false)
    private String companyEmail;

    @Column(nullable = false)
    private String position;

    /*
     * Scheduled start time of the assessment.
     */
    @Column(nullable = false)
    private LocalDateTime startDateTime;

    /*
     * Duration of one candidate's attempt.
     *
     * Example:
     * 60 = candidate gets 60 minutes after starting.
     */
    @Column(nullable = false)
    private Integer durationMinutes;

    /*
     * Assessment lifecycle:
     *
     * DRAFT
     * PUBLISHED
     * LIVE
     * EXPIRED
     */
    @Column(nullable = false)
    private String status = "DRAFT";

    /*
     * When the assessment actually becomes LIVE.
     *
     * This is also the beginning of the 48-hour
     * assessment availability window.
     */
    private LocalDateTime liveAt;

    /*
     * Assessment public link expiration time.
     *
     * Normally:
     *
     * expiresAt = liveAt + 48 hours
     */
    private LocalDateTime expiresAt;

    /*
     * Soft delete.
     *
     * false = normal assessment
     * true  = deleted/hidden assessment
     *
     * We do NOT physically delete the assessment
     * when candidate results exist.
     */
    @Column(nullable = false)
    private Boolean deleted = false;

    /*
     * When the assessment was soft deleted.
     */
    private LocalDateTime deletedAt;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    /*
     * Security settings.
     */
    @Column(nullable = false)
    private Boolean cameraRequired = false;

    @Column(nullable = false)
    private Boolean microphoneRequired = false;

    @Column(nullable = false)
    private Boolean fullscreenRequired = true;

    /*
     * Maximum security warnings before automatic submission.
     *
     * Example:
     * warningLimit = 3
     *
     * 1st violation -> Warning 1
     * 2nd violation -> Warning 2
     * 3rd violation -> Warning 3
     * next violation -> Auto submit
     */
    @Column(nullable = false)
    private Integer warningLimit = 3;

    /*
     * One common public assessment link.
     *
     * Example:
     *
     * /assessment/{publicToken}
     *
     * This token does NOT change when invitations are resent.
     */
    @Column(unique = true, length = 100)
    private String publicToken;

    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public AssessmentAssignment() {
    }

    public AssessmentAssignment(
            User createdBy,
            String companyName,
            String companyEmail,
            String position,
            LocalDateTime startDateTime,
            Integer durationMinutes,
            String instructions,
            Boolean cameraRequired,
            Boolean microphoneRequired,
            Boolean fullscreenRequired,
            Integer warningLimit,
            String publicToken) {

        this.createdBy = createdBy;
        this.companyName = companyName;
        this.companyEmail = companyEmail;
        this.position = position;
        this.startDateTime = startDateTime;
        this.durationMinutes = durationMinutes;

        this.instructions = instructions;

        this.cameraRequired =
                cameraRequired != null
                        ? cameraRequired
                        : false;

        this.microphoneRequired =
                microphoneRequired != null
                        ? microphoneRequired
                        : false;

        this.fullscreenRequired =
                fullscreenRequired != null
                        ? fullscreenRequired
                        : true;

        this.warningLimit =
                warningLimit != null
                        ? warningLimit
                        : 3;

        this.status = "DRAFT";

        this.createdAt = LocalDateTime.now();

        this.deleted = false;

        this.publicToken =
                publicToken != null && !publicToken.trim().isEmpty()
                        ? publicToken
                        : UUID.randomUUID().toString();
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getCompanyEmail() {
        return companyEmail;
    }

    public String getPosition() {
        return position;
    }

    public LocalDateTime getStartDateTime() {
        return startDateTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getLiveAt() {
        return liveAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public Boolean getDeleted() {
        return deleted;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public String getInstructions() {
        return instructions;
    }

    public Boolean getCameraRequired() {
        return cameraRequired;
    }

    public Boolean getMicrophoneRequired() {
        return microphoneRequired;
    }

    public Boolean getFullscreenRequired() {
        return fullscreenRequired;
    }

    public Integer getWarningLimit() {
        return warningLimit;
    }

    public String getPublicToken() {
        return publicToken;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setCompanyEmail(String companyEmail) {
        this.companyEmail = companyEmail;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public void setStartDateTime(LocalDateTime startDateTime) {
        this.startDateTime = startDateTime;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setLiveAt(LocalDateTime liveAt) {
        this.liveAt = liveAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public void setDeleted(Boolean deleted) {
        this.deleted = deleted;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public void setCameraRequired(Boolean cameraRequired) {
        this.cameraRequired = cameraRequired;
    }

    public void setMicrophoneRequired(Boolean microphoneRequired) {
        this.microphoneRequired = microphoneRequired;
    }

    public void setFullscreenRequired(Boolean fullscreenRequired) {
        this.fullscreenRequired = fullscreenRequired;
    }

    public void setWarningLimit(Integer warningLimit) {
        this.warningLimit = warningLimit;
    }

    public void setPublicToken(String publicToken) {
        this.publicToken = publicToken;
    }
}