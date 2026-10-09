package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "assessment_candidate_feedback",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"session_id"}
                )
        }
)
public class AssessmentCandidateFeedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * One feedback record belongs to one candidate session.
     *
     * A session can submit feedback only once.
     */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "session_id",
            nullable = false,
            unique = true
    )
    private AssessmentCandidateSession session;

    /*
     * Overall assessment experience.
     *
     * Allowed range:
     * 1 - 5
     */
    @Column(nullable = false)
    private Integer overallRating;

    /*
     * Candidate's opinion about question quality.
     *
     * Allowed range:
     * 1 - 5
     */
    @Column(nullable = false)
    private Integer questionQualityRating;

    /*
     * Candidate's opinion about the platform experience.
     *
     * Allowed range:
     * 1 - 5
     */
    @Column(nullable = false)
    private Integer platformRating;

    /*
     * Candidate's perception of assessment difficulty.
     *
     * EASY
     * MEDIUM
     * HARD
     */
    @Column(nullable = false)
    private String difficulty;

    /*
     * Whether the candidate experienced a technical issue.
     */
    @Column(nullable = false)
    private Boolean technicalIssue = false;

    /*
     * Optional candidate comments.
     */
    @Column(columnDefinition = "TEXT")
    private String comments;

    /*
     * Server-controlled feedback submission time.
     */
    @Column(nullable = false)
    private LocalDateTime submittedAt;

    public AssessmentCandidateFeedback() {
    }

    public AssessmentCandidateFeedback(
            AssessmentCandidateSession session,
            Integer overallRating,
            Integer questionQualityRating,
            Integer platformRating,
            String difficulty,
            Boolean technicalIssue,
            String comments
    ) {

        this.session = session;
        this.overallRating = overallRating;
        this.questionQualityRating = questionQualityRating;
        this.platformRating = platformRating;
        this.difficulty = difficulty;
        this.technicalIssue =
                technicalIssue != null
                        ? technicalIssue
                        : false;
        this.comments = comments;
        this.submittedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AssessmentCandidateSession getSession() {
        return session;
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public Integer getQuestionQualityRating() {
        return questionQualityRating;
    }

    public Integer getPlatformRating() {
        return platformRating;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public Boolean getTechnicalIssue() {
        return technicalIssue;
    }

    public String getComments() {
        return comments;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setSession(
            AssessmentCandidateSession session) {

        this.session = session;
    }

    public void setOverallRating(
            Integer overallRating) {

        this.overallRating = overallRating;
    }

    public void setQuestionQualityRating(
            Integer questionQualityRating) {

        this.questionQualityRating =
                questionQualityRating;
    }

    public void setPlatformRating(
            Integer platformRating) {

        this.platformRating = platformRating;
    }

    public void setDifficulty(
            String difficulty) {

        this.difficulty = difficulty;
    }

    public void setTechnicalIssue(
            Boolean technicalIssue) {

        this.technicalIssue = technicalIssue;
    }

    public void setComments(
            String comments) {

        this.comments = comments;
    }

    public void setSubmittedAt(
            LocalDateTime submittedAt) {

        this.submittedAt = submittedAt;
    }
}