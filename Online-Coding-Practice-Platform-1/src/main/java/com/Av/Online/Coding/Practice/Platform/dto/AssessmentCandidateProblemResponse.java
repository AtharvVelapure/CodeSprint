package com.Av.Online.Coding.Practice.Platform.dto;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;

public class AssessmentCandidateProblemResponse {

    private Long assignmentProblemId;
    private Long problemId;

    private Integer questionOrder;
    private Double marks;

    private String title;
    private String description;
    private String difficulty;
    private String category;

    private String inputFormat;
    private String outputFormat;
    private String constraints;

    public AssessmentCandidateProblemResponse(
            AssessmentAssignmentProblem assignmentProblem) {

        Problem problem = assignmentProblem.getProblem();

        this.assignmentProblemId =
                assignmentProblem.getId();

        this.problemId =
                problem.getId();

        this.questionOrder =
                assignmentProblem.getQuestionOrder();

        this.marks =
                assignmentProblem.getMarks();

        this.title =
                problem.getTitle();

        this.description =
                problem.getDescription();

        this.difficulty =
                problem.getDifficulty();

        this.category =
                problem.getCategory();

        this.inputFormat =
                problem.getInputFormat();

        this.outputFormat =
                problem.getOutputFormat();

        this.constraints =
                problem.getConstraints();
    }

    public Long getAssignmentProblemId() {
        return assignmentProblemId;
    }

    public Long getProblemId() {
        return problemId;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public Double getMarks() {
        return marks;
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
}