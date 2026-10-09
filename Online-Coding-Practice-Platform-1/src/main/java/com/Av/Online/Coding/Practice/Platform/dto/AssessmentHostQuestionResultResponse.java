package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentHostQuestionResultResponse {

    private Long assignmentProblemId;

    private Long problemId;

    private Integer questionOrder;

    private String title;

    private String difficulty;

    private String category;

    private Double totalMarks;

    private Double marksObtained;

    private String status;

    private Integer passedTestCases;

    private Integer totalTestCases;

    private String language;

    private String code;


    public AssessmentHostQuestionResultResponse() {
    }


    public AssessmentHostQuestionResultResponse(
            Long assignmentProblemId,
            Long problemId,
            Integer questionOrder,
            String title,
            String difficulty,
            String category,
            Double totalMarks,
            Double marksObtained,
            String status,
            Integer passedTestCases,
            Integer totalTestCases,
            String language,
            String code) {

        this.assignmentProblemId = assignmentProblemId;
        this.problemId = problemId;
        this.questionOrder = questionOrder;
        this.title = title;
        this.difficulty = difficulty;
        this.category = category;
        this.totalMarks = totalMarks;
        this.marksObtained = marksObtained;
        this.status = status;
        this.passedTestCases = passedTestCases;
        this.totalTestCases = totalTestCases;
        this.language = language;
        this.code = code;
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

    public String getTitle() {
        return title;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public String getCategory() {
        return category;
    }

    public Double getTotalMarks() {
        return totalMarks;
    }

    public Double getMarksObtained() {
        return marksObtained;
    }

    public String getStatus() {
        return status;
    }

    public Integer getPassedTestCases() {
        return passedTestCases;
    }

    public Integer getTotalTestCases() {
        return totalTestCases;
    }

    public String getLanguage() {
        return language;
    }

    public String getCode() {
        return code;
    }
}