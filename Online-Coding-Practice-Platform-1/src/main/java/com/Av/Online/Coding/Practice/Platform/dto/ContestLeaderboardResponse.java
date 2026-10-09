package com.Av.Online.Coding.Practice.Platform.dto;

public class ContestLeaderboardResponse {

    private int rank;
    private Long userId;
    private String userName;
    private String email;
    private int score;
    private int problemsSolved;
    private int totalSubmissions;

    public ContestLeaderboardResponse() {
    }

    public ContestLeaderboardResponse(
            int rank,
            Long userId,
            String userName,
            String email,
            int score,
            int problemsSolved,
            int totalSubmissions) {

        this.rank = rank;
        this.userId = userId;
        this.userName = userName;
        this.email = email;
        this.score = score;
        this.problemsSolved = problemsSolved;
        this.totalSubmissions = totalSubmissions;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
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

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public int getProblemsSolved() {
        return problemsSolved;
    }

    public void setProblemsSolved(int problemsSolved) {
        this.problemsSolved = problemsSolved;
    }

    public int getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(int totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }
}