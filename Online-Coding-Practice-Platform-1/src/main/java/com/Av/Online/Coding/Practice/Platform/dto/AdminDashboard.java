package com.Av.Online.Coding.Practice.Platform.dto;

public class AdminDashboard {

    private long totalUsers;
    private long totalProblems;
    private long totalAssessments;
    private long totalSubmissions;

    public AdminDashboard() {
    }

    public AdminDashboard(long totalUsers, long totalProblems,
                          long totalAssessments, long totalSubmissions) {
        this.totalUsers = totalUsers;
        this.totalProblems = totalProblems;
        this.totalAssessments = totalAssessments;
        this.totalSubmissions = totalSubmissions;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalProblems() {
        return totalProblems;
    }

    public void setTotalProblems(long totalProblems) {
        this.totalProblems = totalProblems;
    }

    public long getTotalAssessments() {
        return totalAssessments;
    }

    public void setTotalAssessments(long totalAssessments) {
        this.totalAssessments = totalAssessments;
    }

    public long getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(long totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }
}
