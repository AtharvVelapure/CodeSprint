package com.Av.Online.Coding.Practice.Platform.dto;

public class AIChatRequest {

    private String message;

    private Long userId;

    public AIChatRequest() {
    }

    public AIChatRequest(String message, Long userId) {
        this.message = message;
        this.userId = userId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }
}