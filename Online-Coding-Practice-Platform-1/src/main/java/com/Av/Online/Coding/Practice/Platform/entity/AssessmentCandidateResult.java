package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "assessment_candidate_results",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {
                                "session_id",
                                "assignment_problem_id"
                        }
                )
        }
)
public class AssessmentCandidateResult {

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
    private String status;

    @Column(nullable = false)
    private Integer passedTestCases = 0;

    @Column(nullable = false)
    private Integer totalTestCases = 0;

    @Column(nullable = false)
    private Double marksObtained = 0.0;

    @Column(nullable = false)
    private Double totalMarks = 0.0;

    @Column(nullable = false)
    private LocalDateTime evaluatedAt;

    public AssessmentCandidateResult() {
    }

    public AssessmentCandidateResult(
            AssessmentCandidateSession session,
            AssessmentAssignmentProblem assignmentProblem
    ) {
        this.session = session;
        this.assignmentProblem = assignmentProblem;
        this.status = "NOT_ATTEMPTED";
        this.passedTestCases = 0;
        this.totalTestCases = 0;
        this.marksObtained = 0.0;
        this.totalMarks = assignmentProblem.getMarks();
        this.evaluatedAt = LocalDateTime.now();
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getPassedTestCases() {
        return passedTestCases;
    }

    public void setPassedTestCases(Integer passedTestCases) {
        this.passedTestCases = passedTestCases;
    }

    public Integer getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(Integer totalTestCases) {
        this.totalTestCases = totalTestCases;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(Double marksObtained) {
        this.marksObtained = marksObtained;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public void setTotalMarks(Double totalMarks) {
        this.totalMarks = totalMarks;
    }

    public LocalDateTime getEvaluatedAt() {
        return evaluatedAt;
    }

    public void setEvaluatedAt(LocalDateTime evaluatedAt) {
        this.evaluatedAt = evaluatedAt;
    }
}