package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentCandidateFeedbackRequest {

    private Integer overallRating;

    private Integer questionQualityRating;

    private Integer platformRating;

    private String difficulty;

    private Boolean technicalIssue;

    private String comments;

    public AssessmentCandidateFeedbackRequest() {
    }

    public Integer getOverallRating() {
        return overallRating;
    }

    public void setOverallRating(
            Integer overallRating) {

        this.overallRating =
                overallRating;
    }

    public Integer getQuestionQualityRating() {
        return questionQualityRating;
    }

    public void setQuestionQualityRating(
            Integer questionQualityRating) {

        this.questionQualityRating =
                questionQualityRating;
    }

    public Integer getPlatformRating() {
        return platformRating;
    }

    public void setPlatformRating(
            Integer platformRating) {

        this.platformRating =
                platformRating;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(
            String difficulty) {

        this.difficulty = difficulty;
    }

    public Boolean getTechnicalIssue() {
        return technicalIssue;
    }

    public void setTechnicalIssue(
            Boolean technicalIssue) {

        this.technicalIssue =
                technicalIssue;
    }

    public String getComments() {
        return comments;
    }

    public void setComments(
            String comments) {

        this.comments = comments;
    }
}