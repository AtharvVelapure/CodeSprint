package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_invitations")
public class AssessmentInvitation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // ASSESSMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "assessment_id",
        nullable = false
    )
    private AssessmentAssignment assessment;

    // =========================================================
    // CANDIDATE USER
    // =========================================================

    /*
     * Populated when the candidate is an existing
     * CodeSprint user.
     *
     * For an external candidate this can remain null.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "candidate_user_id")
    private User candidateUser;

    // =========================================================
    // CANDIDATE DETAILS
    // =========================================================

    /*
     * Candidate email.
     */
    @Column(nullable = false)
    private String candidateEmail;

    /*
     * Candidate name.
     */
    private String candidateName;

    // =========================================================
    // UNIQUE INVITATION TOKEN
    // =========================================================

    /*
     * Every candidate receives a unique invitation token.
     *
     * Example:
     *
     * Candidate A:
     * /assessment/invite/abc123
     *
     * Candidate B:
     * /assessment/invite/xyz789
     *
     * The token identifies the candidate's
     * invitation and assessment attempt.
     */
    @Column(
        nullable = false,
        unique = true,
        length = 100
    )
    private String invitationToken;

    // =========================================================
    // INVITATION STATUS
    // =========================================================

    /*
     * Possible states:
     *
     * INVITED
     * STARTED
     * COMPLETED
     * CANCELLED
     */
    @Column(nullable = false)
    private String status = "INVITED";

    @Column(nullable = false)
    private LocalDateTime invitedAt;

    private LocalDateTime startedAt;

    private LocalDateTime completedAt;

    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public AssessmentInvitation() {
    }

    public AssessmentInvitation(
            AssessmentAssignment assessment,
            User candidateUser,
            String candidateEmail,
            String candidateName,
            String invitationToken) {

        this.assessment = assessment;
        this.candidateUser = candidateUser;
        this.candidateEmail = candidateEmail;
        this.candidateName = candidateName;
        this.invitationToken = invitationToken;
        this.status = "INVITED";
        this.invitedAt = LocalDateTime.now();
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public AssessmentAssignment getAssessment() {
        return assessment;
    }

    public User getCandidateUser() {
        return candidateUser;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getInvitationToken() {
        return invitationToken;
    }

    public String getStatus() {
        return status;
    }

    public LocalDateTime getInvitedAt() {
        return invitedAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setAssessment(
            AssessmentAssignment assessment) {

        this.assessment = assessment;
    }

    public void setCandidateUser(User candidateUser) {
        this.candidateUser = candidateUser;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public void setInvitationToken(String invitationToken) {
        this.invitationToken = invitationToken;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setInvitedAt(LocalDateTime invitedAt) {
        this.invitedAt = invitedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}