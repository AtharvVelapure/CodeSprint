package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "assessment_candidate_sessions",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"invitation_id"}
                )
        }
)
public class AssessmentCandidateSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * One session belongs to one invitation.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "invitation_id",
            nullable = false,
            unique = true
    )
    private AssessmentInvitation invitation;

    /*
     * Server-controlled assessment start time.
     */
    @Column(nullable = false)
    private LocalDateTime startedAt;

    /*
     * Server-controlled expiry time.
     */
    @Column(nullable = false)
    private LocalDateTime expiresAt;

    /*
     * Set when candidate submits or assessment
     * is automatically submitted.
     */
    private LocalDateTime submittedAt;

    /*
     * IN_PROGRESS
     * SUBMITTED
     * TIME_EXPIRED
     */
    @Column(nullable = false)
    private String status = "IN_PROGRESS";

    /*
     * Number of fullscreen/proctoring warnings.
     */
    @Column(nullable = false)
    private Integer warningCount = 0;

    /*
     * Latest camera state.
     */
    @Column(nullable = false)
    private Boolean cameraActive = false;

    /*
     * Latest microphone state.
     */
    @Column(nullable = false)
    private Boolean microphoneActive = false;

    /*
     * Whether candidate is currently in fullscreen.
     */
    @Column(nullable = false)
    private Boolean fullscreenActive = false;

    public AssessmentCandidateSession() {
    }

    public AssessmentCandidateSession(
            AssessmentInvitation invitation,
            LocalDateTime startedAt,
            LocalDateTime expiresAt) {

        this.invitation = invitation;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
        this.status = "IN_PROGRESS";
        this.warningCount = 0;
        this.cameraActive = false;
        this.microphoneActive = false;
        this.fullscreenActive = false;
    }

    public Long getId() {
        return id;
    }

    public AssessmentInvitation getInvitation() {
        return invitation;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public String getStatus() {
        return status;
    }

    public Integer getWarningCount() {
        return warningCount;
    }

    public Boolean getCameraActive() {
        return cameraActive;
    }

    public Boolean getMicrophoneActive() {
        return microphoneActive;
    }

    public Boolean getFullscreenActive() {
        return fullscreenActive;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setInvitation(
            AssessmentInvitation invitation) {

        this.invitation = invitation;
    }

    public void setStartedAt(
            LocalDateTime startedAt) {

        this.startedAt = startedAt;
    }

    public void setExpiresAt(
            LocalDateTime expiresAt) {

        this.expiresAt = expiresAt;
    }

    public void setSubmittedAt(
            LocalDateTime submittedAt) {

        this.submittedAt = submittedAt;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setWarningCount(
            Integer warningCount) {

        this.warningCount = warningCount;
    }

    public void setCameraActive(
            Boolean cameraActive) {

        this.cameraActive = cameraActive;
    }

    public void setMicrophoneActive(
            Boolean microphoneActive) {

        this.microphoneActive = microphoneActive;
    }

    public void setFullscreenActive(
            Boolean fullscreenActive) {

        this.fullscreenActive = fullscreenActive;
    }
}