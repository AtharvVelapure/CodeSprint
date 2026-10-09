package com.Av.Online.Coding.Practice.Platform.dto;

public class ContestProblemResponse {

    private Long id;
    private ContestResponse contest;
    private ProblemResponse problem;
    private Integer problemOrder;
    private Integer points;

    public ContestProblemResponse() {}

    public ContestProblemResponse(Long id,
                                  ContestResponse contest,
                                  ProblemResponse problem,
                                  Integer problemOrder,
                                  Integer points) {
        this.id = id;
        this.contest = contest;
        this.problem = problem;
        this.problemOrder = problemOrder;
        this.points = points;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ContestResponse getContest() { return contest; }
    public void setContest(ContestResponse contest) { this.contest = contest; }
    public ProblemResponse getProblem() { return problem; }
    public void setProblem(ProblemResponse problem) { this.problem = problem; }
    public Integer getProblemOrder() { return problemOrder; }
    public void setProblemOrder(Integer problemOrder) { this.problemOrder = problemOrder; }
    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; }
}
