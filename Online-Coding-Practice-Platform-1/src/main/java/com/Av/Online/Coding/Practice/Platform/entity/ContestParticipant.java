package com.Av.Online.Coding.Practice.Platform.entity;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "contest_participants",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"contest_id", "user_id"}
        )
    }
)
public class ContestParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "contest_id",
        nullable = false
    )
    private Contest contest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
        name = "user_id",
        nullable = false
    )
    private User user;

    @Column(nullable = false)
    private LocalDateTime registeredAt;

    /*
     * The actual time when the user enters/starts
     * the contest.
     */
    @Column
    private LocalDateTime startedAt;

    /*
     * Server-calculated expiry time.
     *
     * Example:
     *
     * startedAt = 1:30 PM
     * duration = 90 minutes
     * expiresAt = 3:00 PM
     */
    @Column
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    private Integer score = 0;

    @Column(
        name = "participant_rank",
        nullable = false
    )
    private Integer rank = 0;


    // =========================================
    // CONSTRUCTORS
    // =========================================

    public ContestParticipant() {
    }


    public ContestParticipant(
        Contest contest,
        User user,
        LocalDateTime registeredAt
    ) {
        this.contest = contest;
        this.user = user;
        this.registeredAt = registeredAt;
        this.score = 0;
        this.rank = 0;
    }


    // =========================================
    // GETTERS
    // =========================================

    public Long getId() {
        return id;
    }

    public Contest getContest() {
        return contest;
    }

    public User getUser() {
        return user;
    }

    public LocalDateTime getRegisteredAt() {
        return registeredAt;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getExpiresAt() {
        return expiresAt;
    }

    public Integer getScore() {
        return score;
    }

    public Integer getRank() {
        return rank;
    }


    // =========================================
    // SETTERS
    // =========================================

    public void setId(Long id) {
        this.id = id;
    }

    public void setContest(Contest contest) {
        this.contest = contest;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setRegisteredAt(
        LocalDateTime registeredAt
    ) {
        this.registeredAt = registeredAt;
    }

    public void setStartedAt(
        LocalDateTime startedAt
    ) {
        this.startedAt = startedAt;
    }

    public void setExpiresAt(
        LocalDateTime expiresAt
    ) {
        this.expiresAt = expiresAt;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public void setRank(Integer rank) {
        this.rank = rank;
    }
}