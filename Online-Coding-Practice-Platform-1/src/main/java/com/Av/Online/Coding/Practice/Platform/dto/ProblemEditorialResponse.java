package com.Av.Online.Coding.Practice.Platform.dto;

public class ProblemEditorialResponse {

    private Long id;
    private Long problemId;
    private String approach;
    private String algorithm;
    private String explanation;
    private String timeComplexity;
    private String spaceComplexity;

    public ProblemEditorialResponse() {}

    public ProblemEditorialResponse(Long id, Long problemId, String approach, String algorithm,
                                    String explanation, String timeComplexity, String spaceComplexity) {
        this.id = id;
        this.problemId = problemId;
        this.approach = approach;
        this.algorithm = algorithm;
        this.explanation = explanation;
        this.timeComplexity = timeComplexity;
        this.spaceComplexity = spaceComplexity;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }
    public String getApproach() { return approach; }
    public void setApproach(String approach) { this.approach = approach; }
    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }
    public String getExplanation() { return explanation; }
    public void setExplanation(String explanation) { this.explanation = explanation; }
    public String getTimeComplexity() { return timeComplexity; }
    public void setTimeComplexity(String timeComplexity) { this.timeComplexity = timeComplexity; }
    public String getSpaceComplexity() { return spaceComplexity; }
    public void setSpaceComplexity(String spaceComplexity) { this.spaceComplexity = spaceComplexity; }
}
