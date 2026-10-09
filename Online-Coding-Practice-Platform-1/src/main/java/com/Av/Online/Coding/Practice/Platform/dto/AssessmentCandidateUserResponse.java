package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentCandidateUserResponse {

    private Long id;
    private String name;
    private String email;

    public AssessmentCandidateUserResponse() {
    }

    public AssessmentCandidateUserResponse(
            Long id,
            String name,
            String email) {

        this.id = id;
        this.name = name;
        this.email = email;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}