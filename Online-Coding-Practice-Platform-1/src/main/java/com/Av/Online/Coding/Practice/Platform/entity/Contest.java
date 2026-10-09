package com.Av.Online.Coding.Practice.Platform.entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "contests")
public class Contest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(
        nullable = false,
        columnDefinition = "TEXT"
    )
    private String description;

    // =========================================
    // REGISTRATION WINDOW
    // =========================================

    /*
     * Time from which users are allowed
     * to register for the contest.
     */
    @Column(name = "registration_start_time")
    private LocalDateTime registrationStartTime;

    /*
     * Registration closes at this time.
     *
     * This should normally be before or equal
     * to the contest start time.
     */
    @Column(name = "registration_end_time")
    private LocalDateTime registrationEndTime;

    // =========================================
    // CONTEST SCHEDULE
    // =========================================

    @Column(nullable = false)
    private LocalDateTime startTime;

    /*
     * This will be calculated by the backend:
     *
     * endTime = startTime + durationMinutes
     */
    @Column(nullable = false)
    private LocalDateTime endTime;

    @Column(nullable = false)
    private Integer durationMinutes;

    // =========================================
    // STATUS
    // =========================================

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContestStatus status;

    // =========================================
    // CREATED BY
    // =========================================

    @ManyToOne
    @JoinColumn(
        name = "created_by",
        nullable = false
    )
    private User createdBy;

    // =========================================
    // CONSTRUCTORS
    // =========================================

    public Contest() {
    }

    public Contest(
            Long id,
            String title,
            String description,
            LocalDateTime registrationStartTime,
            LocalDateTime registrationEndTime,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer durationMinutes,
            ContestStatus status,
            User createdBy) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.registrationStartTime =
                registrationStartTime;
        this.registrationEndTime =
                registrationEndTime;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
        this.status = status;
        this.createdBy = createdBy;
    }

    // =========================================
    // GETTERS
    // =========================================

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public LocalDateTime getRegistrationStartTime() {
        return registrationStartTime;
    }

    public LocalDateTime getRegistrationEndTime() {
        return registrationEndTime;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public ContestStatus getStatus() {
        return status;
    }

    public User getCreatedBy() {
        return createdBy;
    }

    // =========================================
    // SETTERS
    // =========================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setRegistrationStartTime(
            LocalDateTime registrationStartTime) {

        this.registrationStartTime =
                registrationStartTime;
    }

    public void setRegistrationEndTime(
            LocalDateTime registrationEndTime) {

        this.registrationEndTime =
                registrationEndTime;
    }

    public void setStartTime(
            LocalDateTime startTime) {

        this.startTime = startTime;
    }

    public void setEndTime(
            LocalDateTime endTime) {

        this.endTime = endTime;
    }

    public void setDurationMinutes(
            Integer durationMinutes) {

        this.durationMinutes = durationMinutes;
    }

    public void setStatus(
            ContestStatus status) {

        this.status = status;
    }

    public void setCreatedBy(
            User createdBy) {

        this.createdBy = createdBy;
    }
}