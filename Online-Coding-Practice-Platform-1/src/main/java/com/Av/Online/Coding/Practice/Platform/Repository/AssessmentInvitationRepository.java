package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public interface AssessmentInvitationRepository
        extends JpaRepository<AssessmentInvitation, Long> {

    // =========================================================
    // ALL INVITATIONS FOR AN ASSESSMENT
    // =========================================================

    List<AssessmentInvitation>
    findByAssessmentOrderByInvitedAtDesc(
            AssessmentAssignment assessment
    );

    // =========================================================
    // FIND INVITATION BY UNIQUE TOKEN
    // =========================================================

    /*
     * Each candidate has a unique invitation token.
     *
     * Example:
     *
     * /assessment/invite/abc123
     *
     * This is the main lookup used by the candidate
     * assessment flow.
     */
    Optional<AssessmentInvitation>
    findByInvitationToken(
            String invitationToken
    );

    // =========================================================
    // FIND INVITATION BY ASSESSMENT + CANDIDATE
    // =========================================================

    /*
     * Used by the host when checking whether a candidate
     * has already been invited to this assessment.
     */
    Optional<AssessmentInvitation>
    findByAssessmentAndCandidateEmail(
            AssessmentAssignment assessment,
            String candidateEmail
    );

    /*
     * Used when inviting an existing CodeSprint user.
     */
    boolean existsByAssessmentAndCandidateEmail(
            AssessmentAssignment assessment,
            String candidateEmail
    );

    // =========================================================
    // CANDIDATE INVITATIONS
    // =========================================================

    List<AssessmentInvitation>
    findByCandidateUserOrderByInvitedAtDesc(
            User candidateUser
    );

    // =========================================================
    // COUNT BY STATUS
    // =========================================================

    long countByAssessmentAndStatus(
            AssessmentAssignment assessment,
            String status
    );

    // =========================================================
    // COMPLETED CANDIDATE CHECK
    // =========================================================

    boolean existsByAssessmentAndCandidateEmailAndStatus(
            AssessmentAssignment assessment,
            String candidateEmail,
            String status
    );

    boolean existsByAssessmentAndCandidateUserAndStatus(
            AssessmentAssignment assessment,
            User candidateUser,
            String status
    );
}