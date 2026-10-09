package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentCandidateInfoResponse {

    private Long assessmentId;

    private String companyName;

    private String position;

    private Integer durationMinutes;

    private String instructions;

    private Integer numberOfQuestions;

    private String candidateName;

    private String candidateEmail;

    private String status;

    private Boolean cameraRequired;

    private Boolean microphoneRequired;

    private Boolean fullscreenRequired;

    private Integer warningLimit;

    public AssessmentCandidateInfoResponse() {
    }

    public AssessmentCandidateInfoResponse(
            Long assessmentId,
            String companyName,
            String position,
            Integer durationMinutes,
            String instructions,
            Integer numberOfQuestions,
            String candidateName,
            String candidateEmail,
            String status,
            Boolean cameraRequired,
            Boolean microphoneRequired,
            Boolean fullscreenRequired,
            Integer warningLimit) {

        this.assessmentId = assessmentId;
        this.companyName = companyName;
        this.position = position;
        this.durationMinutes = durationMinutes;
        this.instructions = instructions;
        this.numberOfQuestions = numberOfQuestions;
        this.candidateName = candidateName;
        this.candidateEmail = candidateEmail;
        this.status = status;
        this.cameraRequired = cameraRequired;
        this.microphoneRequired = microphoneRequired;
        this.fullscreenRequired = fullscreenRequired;
        this.warningLimit = warningLimit;
    }

    public Long getAssessmentId() {
        return assessmentId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public String getPosition() {
        return position;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public String getInstructions() {
        return instructions;
    }

    public Integer getNumberOfQuestions() {
        return numberOfQuestions;
    }

    public String getCandidateName() {
        return candidateName;
    }

    public String getCandidateEmail() {
        return candidateEmail;
    }

    public String getStatus() {
        return status;
    }

    public Boolean getCameraRequired() {
        return cameraRequired;
    }

    public Boolean getMicrophoneRequired() {
        return microphoneRequired;
    }

    public Boolean getFullscreenRequired() {
        return fullscreenRequired;
    }

    public Integer getWarningLimit() {
        return warningLimit;
    }

    public void setAssessmentId(Long assessmentId) {
        this.assessmentId = assessmentId;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public void setNumberOfQuestions(Integer numberOfQuestions) {
        this.numberOfQuestions = numberOfQuestions;
    }

    public void setCandidateName(String candidateName) {
        this.candidateName = candidateName;
    }

    public void setCandidateEmail(String candidateEmail) {
        this.candidateEmail = candidateEmail;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public void setCameraRequired(Boolean cameraRequired) {
        this.cameraRequired = cameraRequired;
    }

    public void setMicrophoneRequired(Boolean microphoneRequired) {
        this.microphoneRequired = microphoneRequired;
    }

    public void setFullscreenRequired(Boolean fullscreenRequired) {
        this.fullscreenRequired = fullscreenRequired;
    }

    public void setWarningLimit(Integer warningLimit) {
        this.warningLimit = warningLimit;
    }
}