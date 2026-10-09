package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

@Entity
@Table(
    name = "contest_problems",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"contest_id", "problem_id"})
    }
)
public class ContestProblem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contest_id", nullable = false)
    private Contest contest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @Column(nullable = false)
    private Integer problemOrder;

    @Column(nullable = false)
    private Integer points;

    public ContestProblem() {
    }

    public ContestProblem(
            Long id,
            Contest contest,
            Problem problem,
            Integer problemOrder,
            Integer points) {

        this.id = id;
        this.contest = contest;
        this.problem = problem;
        this.problemOrder = problemOrder;
        this.points = points;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Contest getContest() {
        return contest;
    }

    public void setContest(Contest contest) {
        this.contest = contest;
    }

    public Problem getProblem() {
        return problem;
    }

    public void setProblem(Problem problem) {
        this.problem = problem;
    }

    public Integer getProblemOrder() {
        return problemOrder;
    }

    public void setProblemOrder(Integer problemOrder) {
        this.problemOrder = problemOrder;
    }

    public Integer getPoints() {
        return points;
    }

    public void setPoints(Integer points) {
        this.points = points;
    }
}