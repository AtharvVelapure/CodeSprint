package com.Av.Online.Coding.Practice.Platform.dto;

import java.time.LocalDateTime;

import com.Av.Online.Coding.Practice.Platform.entity.SupportTicket;

public class SupportTicketResponse {

    private Long id;

    private String ticketNumber;

    private Long userId;

    private String userName;

    private String userEmail;

    private String category;

    private String subject;

    private String description;

    private String status;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    private String resolutionMessage;

    public SupportTicketResponse() {
    }

    public SupportTicketResponse(
            SupportTicket ticket) {

        this.id =
                ticket.getId();

        this.ticketNumber =
                ticket.getTicketNumber();

        if (ticket.getUser() != null) {

            this.userId =
                    ticket.getUser().getId();

            this.userName =
                    ticket.getUser().getName();

            this.userEmail =
                    ticket.getUser().getEmail();
        }

        this.category =
                ticket.getCategory() != null
                        ? ticket.getCategory().name()
                        : null;

        this.subject =
                ticket.getSubject();

        this.description =
                ticket.getDescription();

        this.status =
                ticket.getStatus() != null
                        ? ticket.getStatus().name()
                        : null;

        this.createdAt =
                ticket.getCreatedAt();

        this.updatedAt =
                ticket.getUpdatedAt();

        this.resolvedAt =
                ticket.getResolvedAt();

        this.resolutionMessage =
                ticket.getResolutionMessage();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTicketNumber() {
        return ticketNumber;
    }

    public void setTicketNumber(
            String ticketNumber) {

        this.ticketNumber = ticketNumber;
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

    public void setUserName(
            String userName) {

        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(
            String userEmail) {

        this.userEmail = userEmail;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(
            String category) {

        this.category = category;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(
            String subject) {

        this.subject = subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {

        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(
            String status) {

        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt = updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(
            LocalDateTime resolvedAt) {

        this.resolvedAt = resolvedAt;
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