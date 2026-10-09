package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "assessment_candidate_answers",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "session_id",
                                "assignment_problem_id"
                        }
                )
        }
)
public class AssessmentCandidateAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AssessmentCandidateSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assignment_problem_id", nullable = false)
    private AssessmentAssignmentProblem assignmentProblem;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String code;

    @Column(nullable = false)
    private String language;

    @Column(nullable = false)
    private LocalDateTime updatedAt;

    public AssessmentCandidateAnswer() {
    }

    public AssessmentCandidateAnswer(
            AssessmentCandidateSession session,
            AssessmentAssignmentProblem assignmentProblem,
            String code,
            String language
    ) {
        this.session = session;
        this.assignmentProblem = assignmentProblem;
        this.code = code;
        this.language = language;
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public AssessmentCandidateSession getSession() {
        return session;
    }

    public void setSession(AssessmentCandidateSession session) {
        this.session = session;
    }

    public AssessmentAssignmentProblem getAssignmentProblem() {
        return assignmentProblem;
    }

    public void setAssignmentProblem(
            AssessmentAssignmentProblem assignmentProblem) {
        this.assignmentProblem = assignmentProblem;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}