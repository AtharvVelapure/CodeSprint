package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "assessment_security_events",
        indexes = {
                @Index(
                        name = "idx_assessment_security_session",
                        columnList = "session_id"
                ),
                @Index(
                        name = "idx_assessment_security_occurred_at",
                        columnList = "occurred_at"
                )
        }
)
public class AssessmentSecurityEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Security events belong to the server-created candidate session.
     * The browser never supplies or controls this relationship directly.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "session_id",
            nullable = false
    )
    private AssessmentCandidateSession session;

    @Enumerated(EnumType.STRING)
    @Column(
            name = "event_type",
            nullable = false,
            length = 50
    )
    private AssessmentSecurityEventType eventType;

    /*
     * Server timestamp. Do not trust a browser timestamp for enforcement.
     */
    @Column(
            name = "occurred_at",
            nullable = false
    )
    private LocalDateTime occurredAt;

    /*
     * True when this event increased the candidate's warning count.
     */
    @Column(
            name = "warning_issued",
            nullable = false
    )
    private Boolean warningIssued = false;

    /*
     * True when this event caused server-side assessment submission.
     */
    @Column(
            name = "auto_submitted",
            nullable = false
    )
    private Boolean autoSubmitted = false;

    /*
     * Optional diagnostic information only.
     * Never use this field as a trusted security decision input.
     */
    @Column(
            name = "details",
            length = 500
    )
    private String details;

    public AssessmentSecurityEvent() {
    }

    public AssessmentSecurityEvent(
            AssessmentCandidateSession session,
            AssessmentSecurityEventType eventType,
            LocalDateTime occurredAt,
            Boolean warningIssued,
            Boolean autoSubmitted,
            String details) {

        this.session = session;
        this.eventType = eventType;
        this.occurredAt = occurredAt;
        this.warningIssued = warningIssued;
        this.autoSubmitted = autoSubmitted;
        this.details = details;
    }

    public Long getId() {
        return id;
    }

    public AssessmentCandidateSession getSession() {
        return session;
    }

    public AssessmentSecurityEventType getEventType() {
        return eventType;
    }

    public LocalDateTime getOccurredAt() {
        return occurredAt;
    }

    public Boolean getWarningIssued() {
        return warningIssued;
    }

    public Boolean getAutoSubmitted() {
        return autoSubmitted;
    }

    public String getDetails() {
        return details;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSession(
            AssessmentCandidateSession session) {

        this.session = session;
    }

    public void setEventType(
            AssessmentSecurityEventType eventType) {

        this.eventType = eventType;
    }

    public void setOccurredAt(
            LocalDateTime occurredAt) {

        this.occurredAt = occurredAt;
    }

    public void setWarningIssued(
            Boolean warningIssued) {

        this.warningIssued = warningIssued;
    }

    public void setAutoSubmitted(
            Boolean autoSubmitted) {

        this.autoSubmitted = autoSubmitted;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
