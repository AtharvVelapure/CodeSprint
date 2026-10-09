package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateResultRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentFinalResultResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateResult;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

@Service
public class AssessmentCandidateFinalService {

    private final AssessmentInvitationRepository invitationRepository;

    private final AssessmentCandidateSessionRepository sessionRepository;

    private final AssessmentAssignmentProblemRepository assignmentProblemRepository;

    private final AssessmentCandidateResultRepository resultRepository;

    public AssessmentCandidateFinalService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentCandidateSessionRepository sessionRepository,
            AssessmentAssignmentProblemRepository assignmentProblemRepository,
            AssessmentCandidateResultRepository resultRepository) {

        this.invitationRepository = invitationRepository;
        this.sessionRepository = sessionRepository;
        this.assignmentProblemRepository = assignmentProblemRepository;
        this.resultRepository = resultRepository;
    }

    // =========================================================
    // SUBMIT ASSESSMENT USING UNIQUE INVITATION TOKEN
    // =========================================================

    @Transactional
    public AssessmentFinalResultResponse submitAssessment(
            String invitationToken) {

        // =====================================================
        // VALIDATE INVITATION TOKEN
        // =====================================================

        if (invitationToken == null
                || invitationToken.trim().isEmpty()) {

            throw new BadRequestException("Invitation token is required");
        }

        String token =
                invitationToken.trim();

        // =====================================================
        // FIND CANDIDATE INVITATION
        // =====================================================

        AssessmentInvitation invitation =
                invitationRepository
                        .findByInvitationToken(token)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment invitation not found")
                        );

        // =====================================================
        // SUBMIT CANDIDATE SESSION
        // =====================================================

        return submitSession(invitation);
    }

    // =========================================================
    // INTERNAL SESSION SUBMISSION
    // =========================================================

    /*
     * Reusable by:
     *
     * 1. Normal manual submission
     * 2. Timer expiry
     * 3. Security warning limit
     */

    @Transactional
    public AssessmentFinalResultResponse submitSession(
            AssessmentInvitation invitation) {

        if (invitation == null) {

            throw new BadRequestException("Assessment invitation is required");
        }

        AssessmentAssignment assessment =
                invitation.getAssessment();

        if (assessment == null) {

            throw new ResourceNotFoundException("Assessment not found");
        }

        // =====================================================
        // FIND CANDIDATE SESSION
        // =====================================================

        AssessmentCandidateSession session =
                sessionRepository
                        .findByInvitation(invitation)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment session not found")
                        );

        // =====================================================
        // CHECK SESSION STATUS
        // =====================================================

        if ("SUBMITTED".equalsIgnoreCase(
                session.getStatus())) {

            throw new ConflictException("Assessment has already been submitted");
        }

        if ("TIME_EXPIRED".equalsIgnoreCase(
                session.getStatus())) {

            throw new ConflictException("Assessment time has already expired");
        }

        // =====================================================
        // CURRENT SERVER TIME
        // =====================================================

        LocalDateTime now =
                LocalDateTime.now();

        // =====================================================
        // CHECK INDIVIDUAL CANDIDATE TIMER
        // =====================================================

        if (session.getExpiresAt() != null
                && !now.isBefore(
                        session.getExpiresAt())) {

            return autoSubmitExpiredSession(
                    invitation,
                    assessment,
                    session,
                    now
            );
        }

        // =====================================================
        // NORMAL SUBMISSION
        // =====================================================

        return finalizeSession(
                invitation,
                assessment,
                session,
                now
        );
    }

    // =========================================================
    // AUTO SUBMIT EXPIRED SESSION
    // =========================================================

    private AssessmentFinalResultResponse autoSubmitExpiredSession(
            AssessmentInvitation invitation,
            AssessmentAssignment assessment,
            AssessmentCandidateSession session,
            LocalDateTime now) {

        AssessmentFinalResultResponse response =
                calculateAndSaveResult(
                        invitation,
                        assessment,
                        session,
                        now
                );

        session.setStatus("TIME_EXPIRED");

        session.setSubmittedAt(now);

        sessionRepository.save(session);

        invitation.setStatus("COMPLETED");

        invitation.setCompletedAt(now);

        invitationRepository.save(invitation);

        return response;
    }

    // =========================================================
    // NORMAL FINALIZATION
    // =========================================================

    private AssessmentFinalResultResponse finalizeSession(
            AssessmentInvitation invitation,
            AssessmentAssignment assessment,
            AssessmentCandidateSession session,
            LocalDateTime now) {

        AssessmentFinalResultResponse response =
                calculateAndSaveResult(
                        invitation,
                        assessment,
                        session,
                        now
                );

        session.setStatus("SUBMITTED");

        session.setSubmittedAt(now);

        sessionRepository.save(session);

        invitation.setStatus("COMPLETED");

        invitation.setCompletedAt(now);

        invitationRepository.save(invitation);

        return response;
    }

    // =========================================================
    // CALCULATE AND SAVE RESULT
    // =========================================================

    private AssessmentFinalResultResponse calculateAndSaveResult(
            AssessmentInvitation invitation,
            AssessmentAssignment assessment,
            AssessmentCandidateSession session,
            LocalDateTime now) {

        // =====================================================
        // GET QUESTIONS DIRECTLY FROM ASSESSMENT
        // =====================================================

        List<AssessmentAssignmentProblem> questions =
                assignmentProblemRepository
                        .findByAssessmentAssignmentOrderByQuestionOrderAsc(
                                assessment
                        );

        if (questions == null || questions.isEmpty()) {

            throw new ConflictException("No questions found for this assessment");
        }

        // =====================================================
        // CALCULATE MARKS
        // =====================================================

        double totalMarks = 0.0;

        double marksObtained = 0.0;

        int attemptedQuestions = 0;

        int solvedQuestions = 0;

        for (AssessmentAssignmentProblem question : questions) {

            double questionMarks =
                    question.getMarks() != null
                            ? question.getMarks()
                            : 0.0;

            totalMarks += questionMarks;

            AssessmentCandidateResult result =
                    resultRepository
                            .findBySessionAndAssignmentProblem(
                                    session,
                                    question
                            )
                            .orElse(null);

            if (result != null) {

                attemptedQuestions++;

                double obtained =
                        result.getMarksObtained() != null
                                ? result.getMarksObtained()
                                : 0.0;

                marksObtained += obtained;

                if ("Accepted".equalsIgnoreCase(
                        result.getStatus())) {

                    solvedQuestions++;
                }
            }
        }

        // =====================================================
        // CALCULATE PERCENTAGE
        // =====================================================

        double percentage = 0.0;

        if (totalMarks > 0) {

            percentage =
                    (marksObtained / totalMarks) * 100.0;
        }

        percentage =
                Math.round(percentage * 100.0) / 100.0;

        // =====================================================
        // RETURN FINAL RESULT
        // =====================================================

        return new AssessmentFinalResultResponse(
                session.getId(),
                assessment.getId(),
                "SUBMITTED",
                totalMarks,
                marksObtained,
                percentage,
                questions.size(),
                attemptedQuestions,
                solvedQuestions
        );
    }
}