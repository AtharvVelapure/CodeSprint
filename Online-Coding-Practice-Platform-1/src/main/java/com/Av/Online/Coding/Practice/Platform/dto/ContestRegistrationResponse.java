package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

public class ContestRegistrationResponse {

    private boolean registered;
    private LocalDateTime registeredAt;
    private boolean started;
    private LocalDateTime startedAt;
    private LocalDateTime expiresAt;

    public ContestRegistrationResponse(
            boolean registered,
            LocalDateTime registeredAt,
            boolean started,
            LocalDateTime startedAt,
            LocalDateTime expiresAt) {

        this.registered = registered;
        this.registeredAt = registeredAt;
        this.started = started;
        this.startedAt = startedAt;
        this.expiresAt = expiresAt;
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
}