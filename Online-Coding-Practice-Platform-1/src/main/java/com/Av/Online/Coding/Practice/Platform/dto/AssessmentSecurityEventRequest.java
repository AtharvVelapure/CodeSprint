package com.Av.Online.Coding.Practice.Platform.dto;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentSecurityEventType;

public class AssessmentSecurityEventRequest {

    private String invitationToken;
    private AssessmentSecurityEventType eventType;
    private String details;

    public AssessmentSecurityEventRequest() {
    }

    public String getInvitationToken() {
        return invitationToken;
    }

    public void setInvitationToken(String invitationToken) {
        this.invitationToken = invitationToken;
    }

    public AssessmentSecurityEventType getEventType() {
        return eventType;
    }

    public void setEventType(
            AssessmentSecurityEventType eventType) {
        this.eventType = eventType;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }
}
