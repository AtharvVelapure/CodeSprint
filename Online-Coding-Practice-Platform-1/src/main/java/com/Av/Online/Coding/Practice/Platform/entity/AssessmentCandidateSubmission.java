package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assessment_candidate_submissions")
public class AssessmentCandidateSubmission {

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
    private LocalDateTime submittedAt;

    public AssessmentCandidateSubmission() {
    }

    public AssessmentCandidateSubmission(
            AssessmentCandidateSession session,
            AssessmentAssignmentProblem assignmentProblem,
            String code,
            String language
    ) {
        this.session = session;
        this.assignmentProblem = assignmentProblem;
        this.code = code;
        this.language = language;
        this.status = "PENDING";
        this.passedTestCases = 0;
        this.totalTestCases = 0;
        this.marksObtained = 0.0;
        this.submittedAt = LocalDateTime.now();
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

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }
}