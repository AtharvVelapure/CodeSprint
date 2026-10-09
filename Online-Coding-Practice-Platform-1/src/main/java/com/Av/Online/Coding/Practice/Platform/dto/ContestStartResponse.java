package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

public class ContestStartResponse {

    private Long participantId;
    private Long contestId;
    private Long userId;
    private boolean started;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;
    private String message;

    public ContestStartResponse(
            Long participantId,
            Long contestId,
            Long userId,
            boolean started,
            LocalDateTime startedAt,
            LocalDateTime expiresAt,
            String message) {

        this.participantId = participantId;
        this.contestId = contestId;
        this.userId = userId;
        this.started = started;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
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

    public boolean isStarted() {
        return started;
    }

    public void setStarted(boolean started) {
        this.started = started;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}