package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "certification_questions",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"certification_id", "problem_id"}
        )
    }
)
public class CertificationQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /*
     * Certification to which this coding question belongs
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certification_id", nullable = false)
    private Certification certification;

    /*
     * Existing CodeSprint coding problem
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    /*
     * Order in which the problem appears
     * in the certification exam.
     */
    @Column(nullable = false)
    private Integer questionOrder;

    /*
     * Weight of this question in the certification.
     *
     * Example:
     * 3 questions:
     * Q1 = 30%
     * Q2 = 30%
     * Q3 = 40%
     */
    @Column(nullable = false)
    private Double percentageWeight;


    // =========================
    // DEFAULT CONSTRUCTOR
    // =========================

    public CertificationQuestion() {

    }


    // =========================
    // FULL CONSTRUCTOR
    // =========================

    public CertificationQuestion(
            Certification certification,
            Problem problem,
            Integer questionOrder,
            Double percentageWeight) {

        this.certification = certification;
        this.problem = problem;
        this.questionOrder = questionOrder;
        this.percentageWeight = percentageWeight;
    }


    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }


    public Certification getCertification() {
        return certification;
    }

    public void setCertification(Certification certification) {
        this.certification = certification;
    }


    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }


    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }


    public Double getPercentageWeight() {
        return percentageWeight;
    }

    public void setPercentageWeight(Double percentageWeight) {
        this.percentageWeight = percentageWeight;
    }
}