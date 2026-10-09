package com.Av.Online.Coding.Practice.Platform.dto;

public class MyContestResultResponse {

    private Long contestId;
    private String contestTitle;

    private String status;

    private Integer score;
    private Integer rank;

    private Integer problemsSolved;
    private Integer totalSubmissions;

    private String startTime;
    private String endTime;
    private Integer durationMinutes;

    public MyContestResultResponse() {
    }

    public MyContestResultResponse(
            Long contestId,
            String contestTitle,
            String status,
            Integer score,
            Integer rank,
            Integer problemsSolved,
            Integer totalSubmissions,
            String startTime,
            String endTime,
            Integer durationMinutes
    ) {
        this.contestId = contestId;
        this.contestTitle = contestTitle;
        this.status = status;
        this.score = score;
        this.rank = rank;
        this.problemsSolved = problemsSolved;
        this.totalSubmissions = totalSubmissions;
        this.startTime = startTime;
        this.endTime = endTime;
        this.durationMinutes = durationMinutes;
    }

    public Long getContestId() {
        return contestId;
    }

    public void setContestId(Long contestId) {
        this.contestId = contestId;
    }

    public String getContestTitle() {
        return contestTitle;
    }

    public void setContestTitle(String contestTitle) {
        this.contestTitle = contestTitle;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Integer getRank() {
        return rank;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }

    public Integer getProblemsSolved() {
        return problemsSolved;
    }

    public void setProblemsSolved(Integer problemsSolved) {
        this.problemsSolved = problemsSolved;
    }

    public Integer getTotalSubmissions() {
        return totalSubmissions;
    }

    public void setTotalSubmissions(Integer totalSubmissions) {
        this.totalSubmissions = totalSubmissions;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }
}