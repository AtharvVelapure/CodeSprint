package com.Av.Online.Coding.Practice.Platform.dto;

public class ProblemHintResponse {

    private Long id;
    private Long problemId;
    private Integer hintOrder;
    private String hintText;

    public ProblemHintResponse() {}

    public ProblemHintResponse(Long id, Long problemId, Integer hintOrder, String hintText) {
        this.id = id;
        this.problemId = problemId;
        this.hintOrder = hintOrder;
        this.hintText = hintText;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }
    public Integer getHintOrder() { return hintOrder; }
    public void setHintOrder(Integer hintOrder) { this.hintOrder = hintOrder; }
    public String getHintText() { return hintText; }
    public void setHintText(String hintText) { this.hintText = hintText; }
}
