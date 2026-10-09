
package com.Av.Online.Coding.Practice.Platform.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class RunCodeRequest {

    private Long userId;

    @NotNull(message = "Problem ID is required")
    @Positive(message = "Problem ID must be a positive number")
    private Long problemId;

    @NotBlank(message = "Programming language is required")
    @Size(max = 30, message = "Programming language is too long")
    private String language;

    @NotBlank(message = "Code cannot be empty")
    @Size(max = 50000, message = "Code must not exceed 50000 characters")
    private String code;

    public RunCodeRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public String getLanguage() {
        return language;
    }

    public void setLanguage(String language) {
        this.language = language;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }
}
