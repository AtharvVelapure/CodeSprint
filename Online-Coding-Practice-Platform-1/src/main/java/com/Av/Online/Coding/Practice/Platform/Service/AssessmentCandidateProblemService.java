package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateProblemResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

@Service
public class AssessmentCandidateProblemService {

    private final AssessmentInvitationRepository invitationRepository;

    private final AssessmentAssignmentProblemRepository assessmentProblemRepository;

    // =========================================================
    // CONSTRUCTOR
    // =========================================================

    public AssessmentCandidateProblemService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentAssignmentProblemRepository assessmentProblemRepository) {

        this.invitationRepository = invitationRepository;
        this.assessmentProblemRepository = assessmentProblemRepository;
    }

    // =========================================================
    // GET CANDIDATE PROBLEMS
    // =========================================================

    public List<AssessmentCandidateProblemResponse> getCandidateProblems(
            String invitationToken) {

        // =====================================================
        // VALIDATE INVITATION TOKEN
        // =====================================================

        if (invitationToken == null
                || invitationToken.trim().isEmpty()) {

            throw new BadRequestException("Invitation token is required");
        }

        String token = invitationToken.trim();

        // =====================================================
        // FIND CANDIDATE INVITATION
        // =====================================================

        AssessmentInvitation invitation =
                invitationRepository
                        .findByInvitationToken(token)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Invalid assessment invitation")
                        );

        // =====================================================
        // GET ASSESSMENT
        // =====================================================

        AssessmentAssignment assessment =
                invitation.getAssessment();

        if (assessment == null) {

            throw new ResourceNotFoundException("Assessment not found");
        }

        // =====================================================
        // CHECK SOFT DELETE
        // =====================================================

        if (Boolean.TRUE.equals(
                assessment.getDeleted())) {

            throw new ConflictException(
                    "This assessment has been deleted"
            );
        }

        // =====================================================
        // CHECK INVITATION STATUS
        // =====================================================

        String invitationStatus =
                invitation.getStatus();

        if ("COMPLETED".equalsIgnoreCase(
                invitationStatus)) {

            throw new ConflictException(
                    "You have already completed this assessment and cannot retake it"
            );
        }

        if ("CANCELLED".equalsIgnoreCase(
                invitationStatus)) {

            throw new ConflictException(
                    "This assessment invitation has been cancelled"
            );
        }

        // =====================================================
        // CHECK ASSESSMENT STATUS
        // =====================================================

        if (!"LIVE".equalsIgnoreCase(
                assessment.getStatus())) {

            throw new ConflictException(
                    "This assessment is not currently live"
            );
        }

        // =====================================================
        // CHECK 48-HOUR ASSESSMENT WINDOW
        // =====================================================

        LocalDateTime now =
                LocalDateTime.now();

        if (assessment.getLiveAt() == null
                || assessment.getExpiresAt() == null) {

            throw new ConflictException(
                    "Assessment availability window is not configured"
            );
        }

        if (now.isBefore(
                assessment.getLiveAt())) {

            throw new ConflictException(
                    "This assessment has not started yet"
            );
        }

        if (!now.isBefore(
                assessment.getExpiresAt())) {

            throw new ConflictException(
                    "This assessment has expired"
            );
        }

        // =====================================================
        // GET ASSESSMENT QUESTIONS
        // =====================================================

        List<AssessmentAssignmentProblem> problems =
                assessmentProblemRepository
                        .findByAssessmentAssignmentOrderByQuestionOrderAsc(
                                assessment
                        );

        if (problems == null
                || problems.isEmpty()) {

            throw new ConflictException(
                    "No coding problems are assigned to this assessment"
            );
        }

        // =====================================================
        // RETURN QUESTIONS
        // =====================================================

        return problems.stream()
                .map(AssessmentCandidateProblemResponse::new)
                .collect(Collectors.toList());
    }
}