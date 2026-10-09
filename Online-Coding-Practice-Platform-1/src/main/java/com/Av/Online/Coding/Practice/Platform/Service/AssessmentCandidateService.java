package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateInfoResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateProblemResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

@Service
public class AssessmentCandidateService {

    private final AssessmentInvitationRepository invitationRepository;

    private final AssessmentAssignmentProblemRepository
            assessmentProblemRepository;

    // =====================================================
    // CONSTRUCTOR
    // =====================================================

    public AssessmentCandidateService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentAssignmentProblemRepository assessmentProblemRepository) {

        this.invitationRepository = invitationRepository;
        this.assessmentProblemRepository = assessmentProblemRepository;
    }

    // =====================================================
    // GET CANDIDATE INFO
    // =====================================================

    @Transactional(readOnly = true)
    public AssessmentCandidateInfoResponse getCandidateInfo(
            String invitationToken) {

        AssessmentInvitation invitation =
                getValidInvitation(invitationToken);

        AssessmentAssignment assessment =
                getAccessibleAssessment(invitation);

        List<AssessmentAssignmentProblem> problems =
                assessmentProblemRepository
                        .findByAssessmentAssignmentOrderByQuestionOrderAsc(
                                assessment
                        );

        int problemCount =
                problems == null
                        ? 0
                        : problems.size();

        if (problemCount == 0) {

            throw new ConflictException(
                    "This assessment does not contain any coding problems."
            );
        }

        // =================================================
        // CANDIDATE NAME
        // =================================================

        String candidateName =
                invitation.getCandidateName();

        if ((candidateName == null
                || candidateName.trim().isEmpty())
                && invitation.getCandidateUser() != null) {

            candidateName =
                    invitation
                            .getCandidateUser()
                            .getName();
        }

        // =================================================
        // RESPONSE
        // =================================================

        return new AssessmentCandidateInfoResponse(
                assessment.getId(),
                assessment.getCompanyName(),
                assessment.getPosition(),
                assessment.getDurationMinutes(),
                assessment.getInstructions(),
                Integer.valueOf(problemCount),
                candidateName,
                invitation.getCandidateEmail(),
                invitation.getStatus(),
                assessment.getCameraRequired(),
                assessment.getMicrophoneRequired(),
                assessment.getFullscreenRequired(),
                assessment.getWarningLimit()
        );
    }

    // =====================================================
    // GET ASSESSMENT PROBLEMS
    // =====================================================

    @Transactional(readOnly = true)
    public List<AssessmentCandidateProblemResponse>
            getAssessmentProblems(
                    String invitationToken) {

        // =================================================
        // VALIDATE INVITATION
        // =================================================

        AssessmentInvitation invitation =
                getValidInvitation(invitationToken);

        // =================================================
        // VALIDATE ASSESSMENT
        // =================================================

        AssessmentAssignment assessment =
                getAccessibleAssessment(invitation);

        // =================================================
        // QUESTIONS ARE AVAILABLE ONLY WHEN LIVE
        // =================================================

        if (!"LIVE".equalsIgnoreCase(
                assessment.getStatus())) {

            throw new ConflictException(
                    "Assessment questions are available only when the assessment is live."
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        // =================================================
        // LIVE TIME CHECK
        // =================================================

        if (assessment.getLiveAt() == null) {

            throw new ConflictException(
                    "Assessment live time is not configured."
            );
        }

        if (now.isBefore(
                assessment.getLiveAt())) {

            throw new ConflictException(
                    "This assessment has not started yet."
            );
        }

        // =================================================
        // GLOBAL EXPIRY CHECK
        // =================================================

        if (assessment.getExpiresAt() == null) {

            throw new ConflictException(
                    "Assessment expiry time is not configured."
            );
        }

        if (!now.isBefore(
                assessment.getExpiresAt())) {

            throw new ConflictException(
                    "This assessment has expired."
            );
        }

        // =================================================
        // LOAD ASSIGNED PROBLEMS
        // =================================================

        List<AssessmentAssignmentProblem> assignments =
                assessmentProblemRepository
                        .findByAssessmentAssignmentOrderByQuestionOrderAsc(
                                assessment
                        );

        if (assignments == null
                || assignments.isEmpty()) {

            throw new ConflictException(
                    "This assessment does not contain any coding problems."
            );
        }

        // =================================================
        // CONVERT ENTITY -> RESPONSE DTO
        // =================================================

        return assignments
                .stream()
                .map(this::mapProblemResponse)
                .toList();
    }

    // =====================================================
    // MAP ASSESSMENT PROBLEM TO CANDIDATE RESPONSE
    // =====================================================

    private AssessmentCandidateProblemResponse
            mapProblemResponse(
                    AssessmentAssignmentProblem assignmentProblem) {

        if (assignmentProblem == null) {

            throw new ResourceNotFoundException("Assessment problem could not be found.");
        }

        if (assignmentProblem.getProblem() == null) {

            throw new ResourceNotFoundException("A problem assigned to this assessment could not be found.");
        }

        /*
         * Your AssessmentCandidateProblemResponse
         * already accepts AssessmentAssignmentProblem
         * and performs the complete mapping internally.
         */

        return new AssessmentCandidateProblemResponse(
                assignmentProblem
        );
    }

    // =====================================================
    // VALIDATE INVITATION
    // =====================================================

    private AssessmentInvitation getValidInvitation(
            String invitationToken) {

        if (invitationToken == null
                || invitationToken.trim().isEmpty()) {

            throw new BadRequestException("Assessment invitation token is required.");
        }

        String token =
                invitationToken.trim();

        AssessmentInvitation invitation =
                invitationRepository
                        .findByInvitationToken(token)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Invalid assessment invitation.")
                        );

        String invitationStatus =
                invitation.getStatus();

        // =================================================
        // COMPLETED
        // =================================================

        if ("COMPLETED".equalsIgnoreCase(
                invitationStatus)) {

            throw new ConflictException(
                    "This assessment has already been completed."
            );
        }

        // =================================================
        // CANCELLED
        // =================================================

        if ("CANCELLED".equalsIgnoreCase(
                invitationStatus)) {

            throw new ConflictException(
                    "This assessment invitation has been cancelled."
            );
        }

        return invitation;
    }

    // =====================================================
    // VALIDATE ASSESSMENT ACCESS
    // =====================================================

    private AssessmentAssignment getAccessibleAssessment(
            AssessmentInvitation invitation) {

        AssessmentAssignment assessment =
                invitation.getAssessment();

        // =================================================
        // ASSESSMENT EXISTS
        // =================================================

        if (assessment == null) {

            throw new ResourceNotFoundException("Assessment not found.");
        }

        // =================================================
        // SOFT DELETE CHECK
        // =================================================

        if (Boolean.TRUE.equals(
                assessment.getDeleted())) {

            throw new ConflictException(
                    "This assessment is no longer available."
            );
        }

        // =================================================
        // STATUS CHECK
        // =================================================

        String assessmentStatus =
                assessment.getStatus();

        if (assessmentStatus == null) {

            throw new ConflictException(
                    "Assessment status is unavailable."
            );
        }

        // =================================================
        // DRAFT
        // =================================================

        if ("DRAFT".equalsIgnoreCase(
                assessmentStatus)) {

            throw new ConflictException(
                    "This assessment has not been published yet."
            );
        }

        // =================================================
        // EXPIRED
        // =================================================

        if ("EXPIRED".equalsIgnoreCase(
                assessmentStatus)) {

            throw new ConflictException(
                    "This assessment has expired."
            );
        }

        // =================================================
        // ONLY PUBLISHED OR LIVE ARE ACCESSIBLE
        // =================================================

        if (!"PUBLISHED".equalsIgnoreCase(
                assessmentStatus)
                &&
                !"LIVE".equalsIgnoreCase(
                        assessmentStatus)) {

            throw new ConflictException(
                    "This assessment is not currently available."
            );
        }

        // =================================================
        // LIVE GLOBAL EXPIRY CHECK
        // =================================================

        if ("LIVE".equalsIgnoreCase(
                assessmentStatus)) {

            LocalDateTime now =
                    LocalDateTime.now();

            if (assessment.getExpiresAt() == null) {

                throw new ConflictException(
                        "Assessment availability window is not configured."
                );
            }

            if (!now.isBefore(
                    assessment.getExpiresAt())) {

                throw new ConflictException(
                        "This assessment has expired."
                );
            }
        }

        return assessment;
    }
}