package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

import com.Av.Online.Coding.Practice.Platform.entity.ContestStatus;

public class ContestResponse {

    private Long id;

    private String title;

    private String description;

    private LocalDateTime registrationStartTime;

    private LocalDateTime registrationEndTime;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer durationMinutes;

    private ContestStatus status;

    private Long createdById;

    private String createdByName;


    public ContestResponse() {
    }


    public ContestResponse(
            Long id,
            String title,
            String description,
            LocalDateTime registrationStartTime,
            LocalDateTime registrationEndTime,
            LocalDateTime startTime,
            LocalDateTime endTime,
            Integer durationMinutes,
            ContestStatus status,
            Long createdById,
            String createdByName) {

        this.id = id;

        this.title = title;

        this.description = description;

        this.registrationStartTime =
                registrationStartTime;

        this.registrationEndTime =
                registrationEndTime;

        this.startTime = startTime;

        this.endTime = endTime;

        this.durationMinutes =
                durationMinutes;

        this.status = status;

        this.createdById =
                createdById;

        this.createdByName =
                createdByName;
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


    public void setDescription(
            String description) {

        this.description = description;
    }


    public LocalDateTime getRegistrationStartTime() {
        return registrationStartTime;
    }


    public void setRegistrationStartTime(
            LocalDateTime registrationStartTime) {

        this.registrationStartTime =
                registrationStartTime;
    }


    public LocalDateTime getRegistrationEndTime() {
        return registrationEndTime;
    }


    public void setRegistrationEndTime(
            LocalDateTime registrationEndTime) {

        this.registrationEndTime =
                registrationEndTime;
    }


    public LocalDateTime getStartTime() {
        return startTime;
    }


    public void setStartTime(
            LocalDateTime startTime) {

        this.startTime = startTime;
    }


    public LocalDateTime getEndTime() {
        return endTime;
    }


    public void setEndTime(
            LocalDateTime endTime) {

        this.endTime = endTime;
    }


    public Integer getDurationMinutes() {
        return durationMinutes;
    }


    public void setDurationMinutes(
            Integer durationMinutes) {

        this.durationMinutes =
                durationMinutes;
    }


    public ContestStatus getStatus() {
        return status;
    }


    public void setStatus(
            ContestStatus status) {

        this.status = status;
    }


    public Long getCreatedById() {
        return createdById;
    }


    public void setCreatedById(
            Long createdById) {

        this.createdById = createdById;
    }


    public String getCreatedByName() {
        return createdByName;
    }


    public void setCreatedByName(
            String createdByName) {

        this.createdByName =
                createdByName;
    }
}