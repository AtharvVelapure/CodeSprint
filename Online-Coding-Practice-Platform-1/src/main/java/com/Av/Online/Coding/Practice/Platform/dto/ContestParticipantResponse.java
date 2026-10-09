package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

public class ContestParticipantResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String email;
    private LocalDateTime registeredAt;
    private Integer score;
    private Integer rank;

    public ContestParticipantResponse() {
    }

    public ContestParticipantResponse(
            Long id,
            Long userId,
            String userName,
            String email,
            LocalDateTime registeredAt,
            Integer score,
            Integer rank) {

        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.registeredAt = registeredAt;
        this.score = score;
        this.rank = rank;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}