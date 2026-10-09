package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "problem_hints")
public class ProblemHint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(name = "hint_order", nullable = false)
    private Integer hintOrder;

    @Column(name = "hint_text", nullable = false, columnDefinition = "TEXT")
    private String hintText;

    public ProblemHint() {
    }

    public ProblemHint(Long id, Problem problem, Integer hintOrder, String hintText) {
        this.id = id;
        this.problem = problem;
        this.hintOrder = hintOrder;
        this.hintText = hintText;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }

    public Integer getHintOrder() {
        return hintOrder;
    }

    public void setHintOrder(Integer hintOrder) {
        this.hintOrder = hintOrder;
    }

    public String getHintText() {
        return hintText;
    }

    public void setHintText(String hintText) {
        this.hintText = hintText;
    }
}