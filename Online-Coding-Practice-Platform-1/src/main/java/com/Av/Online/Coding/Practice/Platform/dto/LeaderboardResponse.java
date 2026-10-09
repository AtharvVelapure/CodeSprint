package com.Av.Online.Coding.Practice.Platform.dto;

public class LeaderboardResponse {

    private int rank;
    private Long userId;
    private String name;
    private String email;
    private int problemsSolved;
    private int acceptedSubmissions;
    private int totalSubmissions;
    private int easySolved;
    private int mediumSolved;
    private int hardSolved;
    private int points;

    public LeaderboardResponse() {
    }

    public LeaderboardResponse(int rank, Long userId, String name,
                               String email, int problemsSolved,
                               int acceptedSubmissions, int totalSubmissions,
                               int easySolved, int mediumSolved,
                               int hardSolved, int points) {
        this.rank = rank;
        this.userId = userId;
        this.name = name;
        this.email = email;
        this.problemsSolved = problemsSolved;
        this.acceptedSubmissions = acceptedSubmissions;
        this.totalSubmissions = totalSubmissions;
        this.easySolved = easySolved;
        this.mediumSolved = mediumSolved;
        this.hardSolved = hardSolved;
        this.points = points;
    }

    public int getRank() { return rank; }
    public void setRank(int rank) { this.rank = rank; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public int getProblemsSolved() { return problemsSolved; }
    public void setProblemsSolved(int problemsSolved) { this.problemsSolved = problemsSolved; }

    public int getAcceptedSubmissions() { return acceptedSubmissions; }
    public void setAcceptedSubmissions(int acceptedSubmissions) { this.acceptedSubmissions = acceptedSubmissions; }

    public int getTotalSubmissions() { return totalSubmissions; }
    public void setTotalSubmissions(int totalSubmissions) { this.totalSubmissions = totalSubmissions; }

    public int getEasySolved() { return easySolved; }
    public void setEasySolved(int easySolved) { this.easySolved = easySolved; }

    public int getMediumSolved() { return mediumSolved; }
    public void setMediumSolved(int mediumSolved) { this.mediumSolved = mediumSolved; }

    public int getHardSolved() { return hardSolved; }
    public void setHardSolved(int hardSolved) { this.hardSolved = hardSolved; }

    public int getPoints() { return points; }
    public void setPoints(int points) { this.points = points; }
}