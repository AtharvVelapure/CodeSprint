package com.Av.Online.Coding.Practice.Platform.dto;

public class AIUserStatsResponse {

    private Long totalSolved;

    private Long totalAttempted;

    private Long totalSubmissions;
    
    public AIUserStatsResponse() {
		
	}
	
	public AIUserStatsResponse(Long totalSolved, Long totalAttempted, Long totalSubmissions) {
		super();
		this.totalSolved = totalSolved;
		this.totalAttempted = totalAttempted;
		this.totalSubmissions = totalSubmissions;
	}
	
	public Long getTotalSolved() {
		return totalSolved;
	}

	public void setTotalSolved(Long totalSolved) {
		this.totalSolved = totalSolved;
	}

	public Long getTotalAttempted() {
		return totalAttempted;
	}

	public void setTotalAttempted(Long totalAttempted) {
		this.totalAttempted = totalAttempted;
	}

	public Long getTotalSubmissions() {
		return totalSubmissions;
	}

	public void setTotalSubmissions(Long totalSubmissions) {
		this.totalSubmissions = totalSubmissions;
	}
}