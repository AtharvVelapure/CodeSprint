package com.Av.Online.Coding.Practice.Platform.dto;

import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

public class TestCaseResponse {

    private Long id;

    private Long problemId;

    private String input;

    private String expectedOutput;

    private boolean hidden;

    public TestCaseResponse() {
    }

    public TestCaseResponse(TestCase testCase) {

        this.id = testCase.getId();

        if (testCase.getProblem() != null) {
            this.problemId = testCase.getProblem().getId();
        }

        this.input = testCase.getInput();

        this.expectedOutput = testCase.getExpectedOutput();

        this.hidden = testCase.isHidden();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProblemId() {
        return problemId;
    }

    public void setProblemId(Long problemId) {
        this.problemId = problemId;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpectedOutput() {
        return expectedOutput;
    }

    public void setExpectedOutput(String expectedOutput) {
        this.expectedOutput = expectedOutput;
    }

    public boolean isHidden() {
        return hidden;
    }

    public void setHidden(boolean hidden) {
        this.hidden = hidden;
    }
}