package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "certifications")
public class Certification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private String difficulty;

    @Column(nullable = false)
    private Integer durationMinutes;

    @Column(nullable = false)
    private Integer totalQuestions;

    @Column(nullable = false)
    private Integer passingPercentage;

    @Column(nullable = false)
    private String status;

    /*
     * Whether the user is allowed to retake this certification.
     *
     * true  = retake allowed
     * false = retake not allowed
     */
    @Column(nullable = false)
    private Boolean allowRetake = false;

    /*
     * Maximum number of attempts allowed.
     *
     * Example:
     * 1 = only one attempt
     * 3 = maximum three attempts
     *
     * null can later be used for unlimited attempts
     * if we decide to support that.
     */
    @Column
    private Integer maxAttempts;

    // ============================================================
    // DEFAULT CONSTRUCTOR
    // ============================================================

    public Certification() {
    }

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public Certification(
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

    // ============================================================
    // GETTERS AND SETTERS
    // ============================================================

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