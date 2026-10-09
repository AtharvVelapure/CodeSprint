package com.Av.Online.Coding.Practice.Platform.dto;

public class RunCodeResponse {

    private boolean success;

    private String status;

    private String output;

    private String error;
    

    private int passedTestCases;

    private int failedTestCases;

    private int totalTestCases;

    public RunCodeResponse() {
    }

    public RunCodeResponse(
            boolean success,
            String status,
            String output,
            String error) {

        this.success = success;
        this.status = status;
        this.output = output;
        this.error = error;

        this.passedTestCases = 0;
        this.failedTestCases = 0;
        this.totalTestCases = 0;
    }
    
    public RunCodeResponse(
            boolean success,
            String status,
            String output,
            String error,
            int passedTestCases,
            int failedTestCases,
            int totalTestCases) {

        this.success = success;
        this.status = status;
        this.output = output;
        this.error = error;

        this.passedTestCases = passedTestCases;
        this.failedTestCases = failedTestCases;
        this.totalTestCases = totalTestCases;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getOutput() {
        return output;
    }

    public void setOutput(String output) {
        this.output = output;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
    
    public int getPassedTestCases() {
        return passedTestCases;
    }

    public void setPassedTestCases(int passedTestCases) {
        this.passedTestCases = passedTestCases;
    }


    public int getFailedTestCases() {
        return failedTestCases;
    }

    public void setFailedTestCases(int failedTestCases) {
        this.failedTestCases = failedTestCases;
    }


    public int getTotalTestCases() {
        return totalTestCases;
    }

    public void setTotalTestCases(int totalTestCases) {
        this.totalTestCases = totalTestCases;
    }
}