package com.Av.Online.Coding.Practice.Platform.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(
    name = "support_tickets",
    indexes = {
        @Index(
            name = "idx_support_ticket_number",
            columnList = "ticket_number"
        ),
        @Index(
            name = "idx_support_ticket_status",
            columnList = "status"
        )
    }
)
public class SupportTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(
        name = "ticket_number",
        unique = true,
        length = 50
    )
    private String ticketNumber;

    // User who created the ticket
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false
    )
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 50
    )
    private SupportTicketCategory category;

    @Column(
        nullable = false,
        length = 200
    )
    private String subject;

    @Column(
        nullable = false,
        columnDefinition = "TEXT"
    )
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(
        nullable = false,
        length = 30
    )
    private SupportTicketStatus status;

    @Column(
        name = "created_at",
        nullable = false
    )
    private LocalDateTime createdAt;

    @Column(
        name = "updated_at",
        nullable = false
    )
    private LocalDateTime updatedAt;

    @Column(
        name = "resolved_at"
    )
    private LocalDateTime resolvedAt;

    @Column(
        name = "resolution_message",
        columnDefinition = "TEXT"
    )
    private String resolutionMessage;

    // Admin who resolved the ticket
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "resolved_by"
    )
    private User resolvedBy;

    public SupportTicket() {
    }

    @PrePersist
    public void prePersist() {

        LocalDateTime now =
                LocalDateTime.now();

        if (status == null) {
            status = SupportTicketStatus.OPEN;
        }

        if (createdAt == null) {
            createdAt = now;
        }

        if (updatedAt == null) {
            updatedAt = now;
        }
    }

    @PreUpdate
    public void preUpdate() {

        updatedAt =
                LocalDateTime.now();
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

        this.ticketNumber =
                ticketNumber;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public SupportTicketCategory getCategory() {
        return category;
    }

    public void setCategory(
            SupportTicketCategory category) {

        this.category =
                category;
    }

    public String getSubject() {
        return subject;
    }

    public void setSubject(
            String subject) {

        this.subject =
                subject;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(
            String description) {

        this.description =
                description;
    }

    public SupportTicketStatus getStatus() {
        return status;
    }

    public void setStatus(
            SupportTicketStatus status) {

        this.status =
                status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(
            LocalDateTime createdAt) {

        this.createdAt =
                createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(
            LocalDateTime updatedAt) {

        this.updatedAt =
                updatedAt;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(
            LocalDateTime resolvedAt) {

        this.resolvedAt =
                resolvedAt;
    }

    public String getResolutionMessage() {
        return resolutionMessage;
    }

    public void setResolutionMessage(
            String resolutionMessage) {

        this.resolutionMessage =
                resolutionMessage;
    }

    public User getResolvedBy() {
        return resolvedBy;
    }

    public void setResolvedBy(
            User resolvedBy) {

        this.resolvedBy =
                resolvedBy;
    }
}