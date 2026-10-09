package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "assessment_assignment_problems",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {
                "assessment_assignment_id",
                "problem_id"
            }
        )
    }
)
public class AssessmentAssignmentProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // =========================================================
    // ASSESSMENT
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "assessment_assignment_id",
        nullable = false
    )
    private AssessmentAssignment assessmentAssignment;

    // =========================================================
    // PROBLEM
    // =========================================================

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "problem_id",
        nullable = false
    )
    private Problem problem;

    // =========================================================
    // QUESTION DETAILS
    // =========================================================

    @Column(nullable = false)
    private Integer questionOrder;

    @Column(nullable = false)
    private Double marks;

    // =========================================================
    // CONSTRUCTORS
    // =========================================================

    public AssessmentAssignmentProblem() {
    }

    public AssessmentAssignmentProblem(
            AssessmentAssignment assessmentAssignment,
            Problem problem,
            Integer questionOrder,
            Double marks) {

        this.assessmentAssignment = assessmentAssignment;
        this.problem = problem;
        this.questionOrder = questionOrder;
        this.marks = marks;
    }

    // =========================================================
    // GETTERS
    // =========================================================

    public Long getId() {
        return id;
    }

    public AssessmentAssignment getAssessmentAssignment() {
        return assessmentAssignment;
    }

    public Problem getProblem() {
        return problem;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public Double getMarks() {
        return marks;
    }

    // =========================================================
    // SETTERS
    // =========================================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setAssessmentAssignment(
            AssessmentAssignment assessmentAssignment) {

        this.assessmentAssignment = assessmentAssignment;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }
}