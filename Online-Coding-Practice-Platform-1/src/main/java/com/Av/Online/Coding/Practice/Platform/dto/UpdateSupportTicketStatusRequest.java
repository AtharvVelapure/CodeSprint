package com.Av.Online.Coding.Practice.Platform.dto;

public class UpdateSupportTicketStatusRequest {

    private Long adminUserId;

    private String status;

    private String resolutionMessage;

    public UpdateSupportTicketStatusRequest() {
    }

    public Long getAdminUserId() {
        return adminUserId;
    }

    public void setAdminUserId(
            Long adminUserId) {

        this.adminUserId = adminUserId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status) {

        this.status = status;
    }

    public String getResolutionMessage() {
        return resolutionMessage;
    }

    public void setResolutionMessage(
            String resolutionMessage) {

        this.resolutionMessage =
                resolutionMessage;
    }
}