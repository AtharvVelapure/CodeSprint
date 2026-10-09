package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

public class ContestRegisterResponse {

    private Long participantId;
    private Long contestId;
    private Long userId;
    private boolean registered;
    private LocalDateTime registeredAt;
    private String message;

    public ContestRegisterResponse(
            Long participantId,
            Long contestId,
            Long userId,
            boolean registered,
            LocalDateTime registeredAt,
            String message) {

        this.participantId = participantId;
        this.contestId = contestId;
        this.userId = userId;
        this.registered = registered;
        this.registeredAt = registeredAt;
        this.message = message;
    }

    public Long getParticipantId() {
        return participantId;
    }

    public void setParticipantId(Long participantId) {
        this.participantId = participantId;
    }

    public Long getContestId() {
        return contestId;
    }

    public void setContestId(Long contestId) {
        this.contestId = contestId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public boolean isRegistered() {
        return registered;
    }

    public void setRegistered(boolean registered) {
        this.registered = registered;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public void setRegisteredAt(LocalDateTime registeredAt) {
        this.registeredAt = registeredAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}