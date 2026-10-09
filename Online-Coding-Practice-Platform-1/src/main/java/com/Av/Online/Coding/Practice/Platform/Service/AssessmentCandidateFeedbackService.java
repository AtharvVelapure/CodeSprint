package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateFeedbackRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;

import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateFeedbackRequest;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateFeedbackResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCreatorFeedbackResponse;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateFeedback;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class AssessmentCandidateFeedbackService {

    private final AssessmentInvitationRepository invitationRepository;

    private final AssessmentCandidateSessionRepository sessionRepository;

    private final AssessmentCandidateFeedbackRepository feedbackRepository;

    private final AssessmentAssignmentService assessmentAssignmentService;

    public AssessmentCandidateFeedbackService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentCandidateSessionRepository sessionRepository,
            AssessmentCandidateFeedbackRepository feedbackRepository,
            AssessmentAssignmentService assessmentAssignmentService) {

        this.invitationRepository =
                invitationRepository;

        this.sessionRepository =
                sessionRepository;

        this.feedbackRepository =
                feedbackRepository;

        this.assessmentAssignmentService =
                assessmentAssignmentService;
    }


    // =========================================================
    // SUBMIT FEEDBACK
    // =========================================================

    @Transactional
    public AssessmentCandidateFeedbackResponse submitFeedback(
            String invitationToken,
            AssessmentCandidateFeedbackRequest request) {

        // =====================================================
        // VALIDATE TOKEN
        // =====================================================

        if (invitationToken == null
                || invitationToken.trim().isEmpty()) {

            throw new BadRequestException(
                    "Invitation token is required"
            );
        }

        String token =
                invitationToken.trim();


        // =====================================================
        // VALIDATE REQUEST
        // =====================================================

        if (request == null) {

            throw new BadRequestException(
                    "Feedback data is required"
            );
        }

        validateRating(
                request.getOverallRating(),
                "Overall rating"
        );

        validateRating(
                request.getQuestionQualityRating(),
                "Question quality rating"
        );

        validateRating(
                request.getPlatformRating(),
                "Platform rating"
        );


        // =====================================================
        // VALIDATE DIFFICULTY
        // =====================================================

        String difficulty =
                request.getDifficulty();

        if (difficulty == null
                || difficulty.trim().isEmpty()) {

            throw new BadRequestException(
                    "Difficulty is required"
            );
        }

        difficulty =
                difficulty.trim()
                        .toUpperCase();

        if (!difficulty.equals("EASY")
                && !difficulty.equals("MEDIUM")
                && !difficulty.equals("HARD")) {

            throw new BadRequestException(
                    "Difficulty must be EASY, MEDIUM or HARD"
            );
        }


        // =====================================================
        // FIND INVITATION
        // =====================================================

        AssessmentInvitation invitation =
                invitationRepository
                        .findByInvitationToken(token)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment invitation not found"
                                )
                        );


        // =====================================================
        // FIND SESSION
        // =====================================================

        AssessmentCandidateSession session =
                sessionRepository
                        .findByInvitation(invitation)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment session not found"
                                )
                        );


        // =====================================================
        // CHECK ASSESSMENT STATUS
        // =====================================================

        String sessionStatus =
                session.getStatus();

        boolean completed =
                "SUBMITTED".equalsIgnoreCase(
                        sessionStatus
                )
                ||
                "TIME_EXPIRED".equalsIgnoreCase(
                        sessionStatus
                );

        if (!completed) {

            throw new ConflictException(
                    "Assessment must be submitted before feedback can be given"
            );
        }


        // =====================================================
        // CHECK DUPLICATE FEEDBACK
        // =====================================================

        if (feedbackRepository.existsBySession(session)) {

            throw new ConflictException(
                    "Feedback has already been submitted"
            );
        }


        // =====================================================
        // NORMALIZE COMMENTS
        // =====================================================

        String comments =
                request.getComments();

        if (comments != null) {

            comments =
                    comments.trim();

            if (comments.isEmpty()) {
                comments = null;
            }

            if (comments != null
                    && comments.length() > 2000) {

                throw new BadRequestException(
                        "Comments cannot exceed 2000 characters"
                );
            }
        }


        // =====================================================
        // CREATE FEEDBACK
        // =====================================================

        AssessmentCandidateFeedback feedback =
                new AssessmentCandidateFeedback(
                        session,
                        request.getOverallRating(),
                        request.getQuestionQualityRating(),
                        request.getPlatformRating(),
                        difficulty,
                        request.getTechnicalIssue() != null
                                ? request.getTechnicalIssue()
                                : false,
                        comments
                );

        feedback =
                feedbackRepository.save(
                        feedback
                );


        // =====================================================
        // RESPONSE
        // =====================================================

        return mapToResponse(feedback);
    }


    // =========================================================
    // GET FEEDBACK FOR ASSESSMENT CREATOR
    // =========================================================

    @Transactional(readOnly = true)
    public List<AssessmentCreatorFeedbackResponse>
            getAssessmentFeedback(
                    Long userId,
                    Long assessmentId) {

        // =====================================================
        // VERIFY ASSESSMENT OWNER
        // =====================================================

        AssessmentAssignment assessment =
                assessmentAssignmentService
                        .getMyAssessment(
                                userId,
                                assessmentId
                        );


        // =====================================================
        // LOAD FEEDBACK
        // =====================================================

        List<AssessmentCandidateFeedback> feedbackList =
                feedbackRepository
                        .findBySession_Invitation_AssessmentOrderBySubmittedAtDesc(
                                assessment
                        );


        // =====================================================
        // MAP ENTITY -> DTO
        // =====================================================

        return feedbackList
                .stream()
                .map(this::mapCreatorFeedback)
                .toList();
    }


    // =========================================================
    // MAP CREATOR FEEDBACK
    // =========================================================

    private AssessmentCreatorFeedbackResponse
            mapCreatorFeedback(
                    AssessmentCandidateFeedback feedback) {

        AssessmentCandidateSession session =
                feedback.getSession();

        if (session == null) {

            throw new ResourceNotFoundException(
                    "Assessment session not found for feedback"
            );
        }

        AssessmentInvitation invitation =
                session.getInvitation();

        if (invitation == null) {

            throw new ResourceNotFoundException(
                    "Assessment invitation not found for feedback"
            );
        }

        return new AssessmentCreatorFeedbackResponse(
                feedback.getId(),
                session.getId(),
                invitation.getCandidateName(),
                invitation.getCandidateEmail(),
                feedback.getOverallRating(),
                feedback.getQuestionQualityRating(),
                feedback.getPlatformRating(),
                feedback.getDifficulty(),
                feedback.getTechnicalIssue(),
                feedback.getComments(),
                feedback.getSubmittedAt()
        );
    }


    // =========================================================
    // RATING VALIDATION
    // =========================================================

    private void validateRating(
            Integer rating,
            String fieldName) {

        if (rating == null) {

            throw new BadRequestException(
                    fieldName + " is required"
            );
        }

        if (rating < 1 || rating > 5) {

            throw new BadRequestException(
                    fieldName + " must be between 1 and 5"
            );
        }
    }


    // =========================================================
    // MAP CANDIDATE RESPONSE
    // =========================================================

    private AssessmentCandidateFeedbackResponse
            mapToResponse(
                    AssessmentCandidateFeedback feedback) {

        return new AssessmentCandidateFeedbackResponse(
                feedback.getId(),
                feedback.getSession().getId(),
                feedback.getOverallRating(),
                feedback.getQuestionQualityRating(),
                feedback.getPlatformRating(),
                feedback.getDifficulty(),
                feedback.getTechnicalIssue(),
                feedback.getComments(),
                feedback.getSubmittedAt()
        );
    }
}