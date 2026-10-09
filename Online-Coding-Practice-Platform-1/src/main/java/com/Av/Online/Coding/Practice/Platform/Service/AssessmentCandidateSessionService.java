package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateSessionResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

@Service
public class AssessmentCandidateSessionService {

    private final AssessmentInvitationRepository invitationRepository;

    private final AssessmentCandidateSessionRepository sessionRepository;

    private final AssessmentAssignmentService assessmentAssignmentService;

    public AssessmentCandidateSessionService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentCandidateSessionRepository sessionRepository,
            AssessmentAssignmentService assessmentAssignmentService) {

        this.invitationRepository = invitationRepository;
        this.sessionRepository = sessionRepository;
        this.assessmentAssignmentService = assessmentAssignmentService;
    }

    // =========================================================
    // START / RESUME ASSESSMENT
    // =========================================================

    @Transactional
    public AssessmentCandidateSessionResponse startAssessment(
            String invitationToken,
            String candidateName) {

        // =====================================================
        // VALIDATE INVITATION TOKEN
        // =====================================================

        if (invitationToken == null
                || invitationToken.trim().isEmpty()) {

            throw new BadRequestException("Invitation token is required.");
        }

        // =====================================================
        // VALIDATE CANDIDATE NAME
        // =====================================================

        if (candidateName == null
                || candidateName.trim().isEmpty()) {

            throw new BadRequestException("Candidate name is required.");
        }

        String token = invitationToken.trim();

        // =====================================================
        // FIND INVITATION
        // =====================================================

        AssessmentInvitation invitation =
                invitationRepository
                        .findByInvitationToken(token)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Invalid assessment invitation.")
                        );

        // =====================================================
        // GET ASSESSMENT
        // =====================================================

        AssessmentAssignment assessment =
                invitation.getAssessment();

        if (assessment == null) {

            throw new ResourceNotFoundException("Assessment not found.");
        }

        // =====================================================
        // CHECK SOFT DELETE
        // =====================================================

        if (Boolean.TRUE.equals(
                assessment.getDeleted())) {

            throw new ConflictException(
                    "This assessment has been deleted."
            );
        }

        // =====================================================
        // SYNCHRONIZE REQUEST-DRIVEN LIFECYCLE
        // =====================================================

        assessmentAssignmentService.synchronizeStatus(assessment);

        LocalDateTime now = LocalDateTime.now();

        if ("EXPIRED".equalsIgnoreCase(assessment.getStatus())) {
            throw new ConflictException("This assessment has expired.");
        }

        if (!"LIVE".equalsIgnoreCase(assessment.getStatus())) {
            if ("PUBLISHED".equalsIgnoreCase(assessment.getStatus())
                    && assessment.getStartDateTime() != null
                    && now.isBefore(assessment.getStartDateTime())) {
                throw new ConflictException("This assessment has not started yet.");
            }
            throw new ConflictException("This assessment is not currently live.");
        }

        // =====================================================
        // CHECK 48-HOUR ASSESSMENT WINDOW
        // =====================================================

        if (assessment.getLiveAt() == null
                || assessment.getExpiresAt() == null) {

            throw new ConflictException(
                    "Assessment availability window is not configured."
            );
        }

        if (now.isBefore(
                assessment.getLiveAt())) {

            throw new ConflictException(
                    "This assessment has not started yet."
            );
        }

        if (!now.isBefore(
                assessment.getExpiresAt())) {

            assessmentAssignmentService.synchronizeStatus(assessment);

            /*
             * The assessment's global 48-hour availability
             * has ended.
             *
             * A candidate cannot start a new attempt after
             * this point.
             */
            throw new ConflictException(
                    "This assessment has expired."
            );
        }

        // =====================================================
        // CHECK INVITATION STATUS
        // =====================================================

        if ("COMPLETED".equalsIgnoreCase(
                invitation.getStatus())) {

            throw new ConflictException(
                    "This assessment has already been completed and cannot be retaken."
            );
        }

        if ("CANCELLED".equalsIgnoreCase(
                invitation.getStatus())) {

            throw new ConflictException(
                    "This assessment invitation has been cancelled."
            );
        }

        // =====================================================
        // CHECK EXISTING SESSION
        // =====================================================

        AssessmentCandidateSession existingSession =
                sessionRepository
                        .findByInvitation(invitation)
                        .orElse(null);

        if (existingSession != null) {

            // =================================================
            // ALREADY SUBMITTED
            // =================================================

            if ("SUBMITTED".equalsIgnoreCase(
                    existingSession.getStatus())) {

                throw new ConflictException(
                        "This assessment has already been submitted."
                );
            }

            // =================================================
            // ALREADY TIME EXPIRED
            // =================================================

            if ("TIME_EXPIRED".equalsIgnoreCase(
                    existingSession.getStatus())) {

                throw new ConflictException(
                        "The assessment time has expired."
                );
            }

            // =================================================
            // CHECK INDIVIDUAL CANDIDATE TIMER
            // =================================================

            if (existingSession.getExpiresAt() == null) {

                throw new ConflictException(
                        "Assessment session expiry time is missing."
                );
            }

            if (!now.isBefore(
                    existingSession.getExpiresAt())) {

                existingSession.setStatus(
                        "TIME_EXPIRED"
                );

                existingSession.setSubmittedAt(
                        now
                );

                sessionRepository.save(
                        existingSession
                );

                /*
                 * The candidate's individual attempt has ended.
                 */

                invitation.setStatus(
                        "COMPLETED"
                );

                invitation.setCompletedAt(
                        now
                );

                invitationRepository.save(
                        invitation
                );

                throw new ConflictException(
                        "The assessment time has expired."
                );
            }

            // =================================================
            // RESUME EXISTING SESSION
            // =================================================

            return new AssessmentCandidateSessionResponse(
                    existingSession
            );
        }

        // =====================================================
        // CREATE NEW SESSION
        // =====================================================

        LocalDateTime startedAt =
                now;

        /*
         * Individual candidate timer.
         *
         * Example:
         *
         * Assessment available for 48 hours
         * Candidate starts at 3:00 PM
         * Duration = 60 minutes
         * Candidate timer ends at 4:00 PM
         */

        LocalDateTime expiresAt =
                startedAt.plusMinutes(
                        assessment.getDurationMinutes()
                );

        /*
         * Safety:
         *
         * The candidate's session must not extend beyond
         * the assessment's global 48-hour availability.
         */

        if (assessment.getExpiresAt() != null
                && expiresAt.isAfter(
                        assessment.getExpiresAt())) {

            expiresAt =
                    assessment.getExpiresAt();
        }

        AssessmentCandidateSession session =
                new AssessmentCandidateSession(
                        invitation,
                        startedAt,
                        expiresAt
                );

        // =====================================================
        // UPDATE INVITATION
        // =====================================================

        invitation.setCandidateName(
                candidateName.trim()
        );

        invitation.setStartedAt(
                startedAt
        );

        invitation.setStatus(
                "STARTED"
        );

        invitationRepository.save(
                invitation
        );

        // =====================================================
        // SAVE SESSION
        // =====================================================

        AssessmentCandidateSession savedSession =
                sessionRepository.save(
                        session
                );

        return new AssessmentCandidateSessionResponse(
                savedSession
        );
    }
}