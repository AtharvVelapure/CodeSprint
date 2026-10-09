package com.Av.Online.Coding.Practice.Platform.dto;

import com.Av.Online.Coding.Practice.Platform.entity.Problem;

public class ProblemResponse {

    private Long id;

    private String title;

    private String description;

    private String difficulty;

    private String category;

    private String inputFormat;

    private String outputFormat;

    private String constraints;

    private String source;

    private boolean active;


    // ================================
    // DEFAULT CONSTRUCTOR
    // ================================

    public ProblemResponse() {
    }


    // ================================
    // CONSTRUCTOR
    // ================================

    public ProblemResponse(Problem problem) {

        this.id = problem.getId();

        this.title = problem.getTitle();

        this.description = problem.getDescription();

        this.difficulty = problem.getDifficulty();

        this.category = problem.getCategory();

        this.inputFormat = problem.getInputFormat();

        this.outputFormat = problem.getOutputFormat();

        this.constraints = problem.getConstraints();

        this.source = problem.getSource();

        this.active = problem.isActive();
    }


    // ================================
    // GETTERS
    // ================================

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getCategory() {
        return category;
    }

    public String getInputFormat() {
        return inputFormat;
    }

    public String getOutputFormat() {
        return outputFormat;
    }

    public String getConstraints() {
        return constraints;
    }

    public String getSource() {
        return source;
    }

    public boolean isActive() {
        return active;
    }


    // ================================
    // SETTERS
    // ================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public void setInputFormat(String inputFormat) {
        this.inputFormat = inputFormat;
    }

    public void setOutputFormat(String outputFormat) {
        this.outputFormat = outputFormat;
    }

    public void setConstraints(String constraints) {
        this.constraints = constraints;
    }

    public void setSource(String source) {
        this.source = source;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}