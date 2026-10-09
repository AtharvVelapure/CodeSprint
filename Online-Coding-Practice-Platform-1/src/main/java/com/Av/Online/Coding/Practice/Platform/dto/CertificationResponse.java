package com.Av.Online.Coding.Practice.Platform.dto;

public class CertificationResponse {

    private Long id;

    private String title;

    private String description;

    private String category;

    private String difficulty;

    private Integer durationMinutes;

    private Integer totalQuestions;

    private Integer passingPercentage;

    private String status;

    /*
     * Retake configuration
     */
    private Boolean allowRetake;

    private Integer maxAttempts;

    public CertificationResponse() {
    }

    public CertificationResponse(
            Long id,
            String title,
            String description,
            String category,
            String difficulty,
            Integer durationMinutes,
            Integer totalQuestions,
            Integer passingPercentage,
            String status,
            Boolean allowRetake,
            Integer maxAttempts) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.category = category;
        this.difficulty = difficulty;
        this.durationMinutes = durationMinutes;
        this.totalQuestions = totalQuestions;
        this.passingPercentage = passingPercentage;
        this.status = status;
        this.allowRetake = allowRetake;
        this.maxAttempts = maxAttempts;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getDifficulty() {
        return difficulty;
    }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Integer getTotalQuestions() {
        return totalQuestions;
    }

    public void setTotalQuestions(Integer totalQuestions) {
        this.totalQuestions = totalQuestions;
    }

    public Integer getPassingPercentage() {
        return passingPercentage;
    }

    public void setPassingPercentage(Integer passingPercentage) {
        this.passingPercentage = passingPercentage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getAllowRetake() {
        return allowRetake;
    }

    public void setAllowRetake(Boolean allowRetake) {
        this.allowRetake = allowRetake;
    }

    public Integer getMaxAttempts() {
        return maxAttempts;
    }

    public void setMaxAttempts(Integer maxAttempts) {
        this.maxAttempts = maxAttempts;
    }
}