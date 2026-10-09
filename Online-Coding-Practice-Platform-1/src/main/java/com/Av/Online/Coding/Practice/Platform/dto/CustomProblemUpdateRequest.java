package com.Av.Online.Coding.Practice.Platform.dto;

import com.Av.Online.Coding.Practice.Platform.entity.Problem;

public class CustomProblemUpdateRequest {

    private Problem problem;

    private Integer questionOrder;

    private Double percentageWeight;

    // ============================================================
    // DEFAULT CONSTRUCTOR
    // ============================================================

    public CustomProblemUpdateRequest() {
    }

    // ============================================================
    // GETTERS AND SETTERS
    // ============================================================

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