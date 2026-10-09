package com.Av.Online.Coding.Practice.Platform.dto;

public class EditorialAccessResponse {

    private boolean unlocked;
    private long unsuccessfulAttempts;
    private int requiredAttempts;
    private ProblemEditorialResponse editorial;

    public EditorialAccessResponse() {}

    public EditorialAccessResponse(boolean unlocked, long unsuccessfulAttempts, int requiredAttempts,
                                   ProblemEditorialResponse editorial) {
        this.unlocked = unlocked;
        this.unsuccessfulAttempts = unsuccessfulAttempts;
        this.requiredAttempts = requiredAttempts;
        this.editorial = editorial;
    }

    public boolean isUnlocked() { return unlocked; }
    public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }
    public long getUnsuccessfulAttempts() { return unsuccessfulAttempts; }
    public void setUnsuccessfulAttempts(long unsuccessfulAttempts) { this.unsuccessfulAttempts = unsuccessfulAttempts; }
    public int getRequiredAttempts() { return requiredAttempts; }
    public void setRequiredAttempts(int requiredAttempts) { this.requiredAttempts = requiredAttempts; }
    public ProblemEditorialResponse getEditorial() { return editorial; }
    public void setEditorial(ProblemEditorialResponse editorial) { this.editorial = editorial; }
}
