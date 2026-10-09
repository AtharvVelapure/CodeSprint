package com.Av.Online.Coding.Practice.Platform.Service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class AssessmentWarningService {

    private static final int DEFAULT_WARNING_LIMIT = 3;

    private final AssessmentCandidateSessionRepository sessionRepository;

    public AssessmentWarningService(
            AssessmentCandidateSessionRepository sessionRepository) {

        this.sessionRepository = sessionRepository;
    }

    // =========================================================
    // REGISTER SERVER-SIDE WARNING
    // =========================================================

    /*
     * The browser must never send the new warning count.
     *
     * The backend reads the current count from the persisted
     * candidate session, increments it, saves it, and then checks
     * the assessment's configured warning limit.
     *
     * Return value:
     * true  -> warning limit has been reached
     * false -> candidate may continue
     */
    @Transactional
    public boolean registerWarning(
            AssessmentCandidateSession session) {

        validateActiveSession(session);

        Integer currentWarningCount =
                session.getWarningCount();

        if (currentWarningCount == null
                || currentWarningCount < 0) {

            currentWarningCount = 0;
        }

        int updatedWarningCount =
                currentWarningCount + 1;

        session.setWarningCount(
                updatedWarningCount
        );

        sessionRepository.save(session);

        int warningLimit =
                resolveWarningLimit(session);

        return updatedWarningCount >= warningLimit;
    }

    // =========================================================
    // GET CURRENT WARNING COUNT
    // =========================================================

    public int getWarningCount(
            AssessmentCandidateSession session) {

        if (session == null) {
            throw new ResourceNotFoundException(
                    "Assessment candidate session not found."
            );
        }

        Integer warningCount =
                session.getWarningCount();

        return warningCount != null
                && warningCount > 0
                ? warningCount
                : 0;
    }

    // =========================================================
    // GET WARNING LIMIT
    // =========================================================

    public int getWarningLimit(
            AssessmentCandidateSession session) {

        validateSessionExists(session);

        return resolveWarningLimit(session);
    }

    // =========================================================
    // CHECK WARNING LIMIT
    // =========================================================

    public boolean hasReachedWarningLimit(
            AssessmentCandidateSession session) {

        validateSessionExists(session);

        return getWarningCount(session)
                >= resolveWarningLimit(session);
    }

    // =========================================================
    // RESOLVE WARNING LIMIT FROM ASSESSMENT
    // =========================================================

    private int resolveWarningLimit(
            AssessmentCandidateSession session) {

        AssessmentInvitation invitation =
                session.getInvitation();

        if (invitation == null) {
            throw new ResourceNotFoundException(
                    "Assessment invitation not found for candidate session."
            );
        }

        AssessmentAssignment assessment =
                invitation.getAssessment();

        if (assessment == null) {
            throw new ResourceNotFoundException(
                    "Assessment not found for candidate session."
            );
        }

        Integer configuredWarningLimit =
                assessment.getWarningLimit();

        if (configuredWarningLimit == null
                || configuredWarningLimit <= 0) {

            return DEFAULT_WARNING_LIMIT;
        }

        return configuredWarningLimit;
    }

    // =========================================================
    // VALIDATE ACTIVE SESSION
    // =========================================================

    private void validateActiveSession(
            AssessmentCandidateSession session) {

        validateSessionExists(session);

        String status =
                session.getStatus();

        if (!"IN_PROGRESS".equalsIgnoreCase(status)) {

            throw new ConflictException(
                    "Security warnings cannot be added because the assessment session is not active."
            );
        }
    }

    // =========================================================
    // VALIDATE SESSION EXISTS
    // =========================================================

    private void validateSessionExists(
            AssessmentCandidateSession session) {

        if (session == null) {
            throw new ResourceNotFoundException(
                    "Assessment candidate session not found."
            );
        }
    }
}
