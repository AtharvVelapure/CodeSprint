package com.Av.Online.Coding.Practice.Platform.dto;

public class CertificationQuestionRequest {

    private Long problemId;

    private Integer questionOrder;

    private Double percentageWeight;


    // ============================================================
    // DEFAULT CONSTRUCTOR
    // ============================================================

    public CertificationQuestionRequest() {
    }


    // ============================================================
    // GETTERS AND SETTERS
    // ============================================================

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
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

    public void setPercentageWeight(
            Double percentageWeight) {

        this.percentageWeight =
                percentageWeight;
    }
}