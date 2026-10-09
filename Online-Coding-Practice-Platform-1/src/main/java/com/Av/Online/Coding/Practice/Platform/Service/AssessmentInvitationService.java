package com.Av.Online.Coding.Practice.Platform.Service;

import org.springframework.beans.factory.annotation.Value;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentHostVerificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateUserResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostVerification;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.entity.User;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AssessmentInvitationService {

    @Value("${app.frontend.base-url:http://localhost:5173}")
    private String frontendBaseUrl;

    private final AssessmentInvitationRepository invitationRepository;
    private final AssessmentAssignmentRepository assessmentRepository;
    private final AssessmentHostVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    public AssessmentInvitationService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentAssignmentRepository assessmentRepository,
            AssessmentHostVerificationRepository verificationRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.invitationRepository = invitationRepository;
        this.assessmentRepository = assessmentRepository;
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }

    // =========================================================
    // SEARCH EXISTING CODESPRINT USERS
    // =========================================================

    public List<AssessmentCandidateUserResponse> searchUsers(
            Long hostUserId,
            Long assessmentId,
            String search) {

        // User discovery is only available to the approved host who owns
        // the published/live assessment.
        getAssessmentForInvitationManagement(hostUserId, assessmentId);

        List<User> users;

        if (search == null || search.trim().isEmpty()) {
            users = userRepository.findByActive(true);
        } else {
            users = userRepository.searchActiveUsers(search.trim());
        }

        return users.stream()
                .map(user ->
                        new AssessmentCandidateUserResponse(
                                user.getId(),
                                user.getName(),
                                user.getEmail()
                        )
                )
                .collect(Collectors.toList());
    }

    // =========================================================
    // INVITE EXISTING CODESPRINT USER
    // =========================================================

    @Transactional
    public AssessmentInvitation inviteUser(
            Long hostUserId,
            Long assessmentId,
            Long candidateUserId) {

        AssessmentAssignment assessment =
                getAssessmentForInvitationManagement(
                        hostUserId,
                        assessmentId
                );

        if (candidateUserId == null) {
            throw new BadRequestException(
                    "Candidate user ID is required"
            );
        }

        User candidate =
                userRepository.findById(candidateUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Candidate user not found"
                                )
                        );

        if (!candidate.isActive()) {
            throw new ConflictException(
                    "Candidate user is inactive"
            );
        }

        return createOrResendInvitation(
                assessment,
                candidate,
                candidate.getEmail(),
                candidate.getName()
        );
    }

    // =========================================================
    // INVITE EXTERNAL CANDIDATE
    // =========================================================

    @Transactional
    public AssessmentInvitation inviteExternalCandidate(
            Long hostUserId,
            Long assessmentId,
            String candidateEmail) {

        AssessmentAssignment assessment =
                getAssessmentForInvitationManagement(
                        hostUserId,
                        assessmentId
                );

        if (candidateEmail == null
                || candidateEmail.trim().isEmpty()) {

            throw new BadRequestException(
                    "Candidate email is required"
            );
        }

        String email =
                candidateEmail.trim().toLowerCase();

        return createOrResendInvitation(
                assessment,
                null,
                email,
                null
        );
    }

    // =========================================================
    // CREATE OR RESEND INVITATION
    // =========================================================

    private AssessmentInvitation createOrResendInvitation(
            AssessmentAssignment assessment,
            User candidateUser,
            String candidateEmail,
            String candidateName) {

        AssessmentInvitation existingInvitation =
                invitationRepository
                        .findByAssessmentAndCandidateEmail(
                                assessment,
                                candidateEmail
                        )
                        .orElse(null);

        if (existingInvitation != null) {

            String status =
                    existingInvitation.getStatus();

            if ("COMPLETED".equalsIgnoreCase(status)) {
                throw new ConflictException(
                        "This candidate has already completed this assessment and cannot retake it."
                );
            }

            if ("STARTED".equalsIgnoreCase(status)) {
                sendInvitationEmail(existingInvitation);
                return existingInvitation;
            }

            if ("INVITED".equalsIgnoreCase(status)) {

                existingInvitation.setInvitedAt(
                        LocalDateTime.now()
                );

                AssessmentInvitation saved =
                        invitationRepository.save(
                                existingInvitation
                        );

                sendInvitationEmail(saved);
                return saved;
            }

            if ("CANCELLED".equalsIgnoreCase(status)) {
                throw new ConflictException(
                        "This candidate's invitation has been cancelled."
                );
            }

            throw new ConflictException(
                    "Candidate invitation cannot be resent in its current status: "
                            + status
            );
        }

        String invitationToken =
                UUID.randomUUID().toString();

        AssessmentInvitation invitation =
                new AssessmentInvitation(
                        assessment,
                        candidateUser,
                        candidateEmail,
                        candidateName,
                        invitationToken
                );

        invitation.setStatus("INVITED");

        invitation.setInvitedAt(
                LocalDateTime.now()
        );

        AssessmentInvitation saved =
                invitationRepository.save(
                        invitation
                );

        sendInvitationEmail(saved);

        return saved;
    }

    // =========================================================
    // SEND INVITATION EMAIL
    // =========================================================

    private void sendInvitationEmail(
            AssessmentInvitation invitation) {

        if (invitation == null) {
            throw new BadRequestException(
                    "Invitation is required"
            );
        }

        if (invitation.getInvitationToken() == null
                || invitation.getInvitationToken().trim().isEmpty()) {

            throw new ConflictException(
                    "Invitation token is not available"
            );
        }

        AssessmentAssignment assessment =
                invitation.getAssessment();

        if (assessment == null) {
            throw new ResourceNotFoundException(
                    "Assessment not found for invitation"
            );
        }

        String assessmentLink =
                frontendBaseUrl + "/assessment/invite/"
                        + invitation.getInvitationToken();

        emailService.sendAssessmentInvitation(
                invitation.getCandidateEmail(),
                invitation.getCandidateName(),
                assessment.getCompanyName(),
                assessment.getPosition(),
                assessment.getDurationMinutes(),
                assessmentLink
        );
    }

    // =========================================================
    // GET ASSESSMENT INVITATIONS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AssessmentInvitation> getAssessmentInvitations(
            Long hostUserId,
            Long assessmentId) {

        AssessmentAssignment assessment =
                getAssessmentForHostView(
                        hostUserId,
                        assessmentId
                );

        return invitationRepository
                .findByAssessmentOrderByInvitedAtDesc(
                        assessment
                );
    }

    // =========================================================
    // VERIFY HOST AND ASSESSMENT
    // =========================================================

    private AssessmentAssignment getAssessmentForHostView(
            Long hostUserId,
            Long assessmentId) {

        if (hostUserId == null) {
            throw new BadRequestException(
                    "Host user ID is required"
            );
        }

        if (assessmentId == null) {
            throw new BadRequestException(
                    "Assessment ID is required"
            );
        }

        User host =
                userRepository.findById(hostUserId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Host user not found"
                                )
                        );

        AssessmentHostVerification verification =
                verificationRepository
                        .findFirstByUserAndStatus(
                                host,
                                "APPROVED"
                        )
                        .orElseThrow(() ->
                                new ForbiddenException(
                                        "Assessment host is not approved"
                                )
                        );

        AssessmentAssignment assessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment not found"
                                )
                        );

        if (assessment.getCreatedBy() == null
                || assessment.getCreatedBy().getId() == null
                || !assessment.getCreatedBy()
                        .getId()
                        .equals(host.getId())) {

            throw new ForbiddenException(
                    "You are not allowed to manage this assessment."
            );
        }

        if (Boolean.TRUE.equals(
                assessment.getDeleted())) {

            throw new ConflictException(
                    "This assessment has been deleted."
            );
        }

        return assessment;
    }


    private AssessmentAssignment getAssessmentForInvitationManagement(
            Long hostUserId,
            Long assessmentId) {

        AssessmentAssignment assessment =
                getAssessmentForHostView(hostUserId, assessmentId);

        String status = assessment.getStatus() != null
                ? assessment.getStatus().toUpperCase()
                : "";

        if ("DRAFT".equals(status)) {
            throw new ConflictException(
                    "Assessment must be published before sending invitations."
            );
        }

        if ("PUBLISHED".equals(status)) {
            return assessment;
        }

        if ("LIVE".equals(status)) {
            LocalDateTime now = LocalDateTime.now();
            if (assessment.getExpiresAt() != null
                    && !now.isBefore(assessment.getExpiresAt())) {
                throw new ConflictException(
                        "The assessment link has expired. New invitations cannot be sent."
                );
            }
            return assessment;
        }

        if ("EXPIRED".equals(status)) {
            throw new ConflictException(
                    "This assessment has expired. Invitations cannot be sent."
            );
        }

        throw new ConflictException(
                "Assessment is not available for invitations."
        );
    }
}
