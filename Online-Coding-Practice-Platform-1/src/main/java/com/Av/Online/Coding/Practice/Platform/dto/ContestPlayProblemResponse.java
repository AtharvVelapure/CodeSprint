package com.Av.Online.Coding.Practice.Platform.dto;

public class ContestPlayProblemResponse {

    private Long contestProblemId;

    private Long problemId;

    private Integer problemOrder;

    private Integer points;

    private String title;

    private String description;

    private String difficulty;

    private String category;

    private String inputFormat;

    private String outputFormat;

    private String constraints;


    public ContestPlayProblemResponse() {
    }


    public ContestPlayProblemResponse(
            Long contestProblemId,
            Long problemId,
            Integer problemOrder,
            Integer points,
            String title,
            String description,
            String difficulty,
            String category,
            String inputFormat,
            String outputFormat,
            String constraints) {

        this.contestProblemId = contestProblemId;
        this.problemId = problemId;
        this.problemOrder = problemOrder;
        this.points = points;
        this.title = title;
        this.description = description;
        this.difficulty = difficulty;
        this.category = category;
        this.inputFormat = inputFormat;
        this.outputFormat = outputFormat;
        this.constraints = constraints;
    }


    public Long getContestProblemId() {
        return contestProblemId;
    }

    public void setContestProblemId(Long contestProblemId) {
        this.contestProblemId = contestProblemId;
    }


    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
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


    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }


    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }


    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }


    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }


    public String getInputFormat() {
        return inputFormat;
    }

    public void setInputFormat(String inputFormat) {
        this.inputFormat = inputFormat;
    }


    public String getOutputFormat() {
        return outputFormat;
    }

    public void setOutputFormat(String outputFormat) {
        this.outputFormat = outputFormat;
    }


    public String getConstraints() {
        return constraints;
    }

    public void setConstraints(String constraints) {
        this.constraints = constraints;
    }
}