package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentHostVerificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostVerification;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.entity.User;

@Service
public class AssessmentAssignmentService {

    private final AssessmentAssignmentRepository assessmentRepository;

    private final AssessmentHostVerificationRepository verificationRepository;

    private final UserRepository userRepository;

    private final AssessmentAssignmentProblemRepository assessmentProblemRepository;

    private final AssessmentInvitationRepository invitationRepository;

    private final EmailService emailService;

    public AssessmentAssignmentService(
            AssessmentAssignmentRepository assessmentRepository,
            AssessmentHostVerificationRepository verificationRepository,
            UserRepository userRepository,
            AssessmentAssignmentProblemRepository assessmentProblemRepository,
            AssessmentInvitationRepository invitationRepository,
            EmailService emailService) {

        this.assessmentRepository = assessmentRepository;
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.assessmentProblemRepository = assessmentProblemRepository;
        this.invitationRepository = invitationRepository;
        this.emailService = emailService;
    }

    // =========================================================
    // CREATE ASSESSMENT
    // =========================================================

    @Transactional
    public AssessmentAssignment createAssessment(
            Long userId,
            String companyName,
            String companyEmail,
            String position,
            LocalDateTime startDateTime,
            Integer durationMinutes,
            String instructions,
            Boolean cameraRequired,
            Boolean microphoneRequired,
            Boolean fullscreenRequired,
            Integer warningLimit) {

        User user = getUser(userId);

        verifyHost(user);

        validateAssessmentData(
                companyName,
                companyEmail,
                position,
                startDateTime,
                durationMinutes,
                warningLimit
        );

        AssessmentAssignment assessment =
                new AssessmentAssignment(
                        user,
                        companyName.trim(),
                        companyEmail.trim(),
                        position.trim(),
                        startDateTime,
                        durationMinutes,
                        instructions,
                        cameraRequired,
                        microphoneRequired,
                        fullscreenRequired,
                        warningLimit,
                        null
                );

        /*
         * New assessments always start as DRAFT.
         */
        assessment.setStatus("DRAFT");

        /*
         * The AssessmentAssignment constructor should normally
         * create the publicToken.
         *
         * This is a safety check in case an old entity/database
         * object does not have one.
         */
        if (assessment.getPublicToken() == null
                || assessment.getPublicToken().trim().isEmpty()) {

            assessment.setPublicToken(
                    UUID.randomUUID().toString()
            );
        }

        assessment.setDeleted(false);
        assessment.setDeletedAt(null);
        assessment.setLiveAt(null);
        assessment.setExpiresAt(null);

        return assessmentRepository.save(assessment);
    }

    // =========================================================
    // GET MY ASSESSMENTS
    // =========================================================

    @Transactional
    public List<AssessmentAssignment> getMyAssessments(
            Long userId) {

        User user = getUser(userId);

        verifyHost(user);

        List<AssessmentAssignment> assessments =
                assessmentRepository
                        .findByCreatedByOrderByCreatedAtDesc(user);

        /*
         * Soft-deleted assessments are not shown in the
         * normal assessment management list.
         */
        return assessments.stream()
                .filter(assessment ->
                        !Boolean.TRUE.equals(
                                assessment.getDeleted()
                        )
                )
                .map(assessment -> {

                    synchronizeStatus(assessment);

                    return assessment;

                })
                .collect(Collectors.toList());
    }

    // =========================================================
    // GET SINGLE ASSESSMENT
    // =========================================================

    @Transactional
    public AssessmentAssignment getMyAssessment(
            Long userId,
            Long assessmentId) {

        User user = getUser(userId);

        verifyHost(user);

        AssessmentAssignment assessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment not found")
                        );

        verifyAssessmentOwner(
                assessment,
                user
        );

        if (Boolean.TRUE.equals(assessment.getDeleted())) {
            throw new ConflictException(
                    "This assessment has been deleted"
            );
        }

        synchronizeStatus(assessment);

        return assessment;
    }

    // =========================================================
    // UPDATE ASSESSMENT
    // =========================================================

    @Transactional
    public AssessmentAssignment updateAssessment(
            Long userId,
            Long assessmentId,
            String companyName,
            String companyEmail,
            String position,
            LocalDateTime startDateTime,
            Integer durationMinutes,
            String instructions,
            Boolean cameraRequired,
            Boolean microphoneRequired,
            Boolean fullscreenRequired,
            Integer warningLimit) {

        User user = getUser(userId);

        verifyHost(user);

        AssessmentAssignment assessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment not found")
                        );

        verifyAssessmentOwner(
                assessment,
                user
        );

        if (Boolean.TRUE.equals(assessment.getDeleted())) {
            throw new ConflictException(
                    "This assessment has been deleted"
            );
        }

        /*
         * Synchronize first so a scheduled PUBLISHED
         * assessment automatically becomes LIVE when
         * its start time has arrived.
         */
        synchronizeStatus(assessment);

        /*
         * Only DRAFT and PUBLISHED can be edited.
         */
        if (!isEditable(assessment)) {

            throw new ConflictException(
                    "This assessment cannot be edited because it is already LIVE or EXPIRED."
            );
        }

        validateAssessmentData(
                companyName,
                companyEmail,
                position,
                startDateTime,
                durationMinutes,
                warningLimit
        );

        /*
         * Save the new values.
         */
        assessment.setCompanyName(
                companyName.trim()
        );

        assessment.setCompanyEmail(
                companyEmail.trim()
        );

        assessment.setPosition(
                position.trim()
        );

        assessment.setStartDateTime(
                startDateTime
        );

        assessment.setDurationMinutes(
                durationMinutes
        );

        assessment.setInstructions(
                instructions
        );

        assessment.setCameraRequired(
                cameraRequired != null
                        ? cameraRequired
                        : false
        );

        assessment.setMicrophoneRequired(
                microphoneRequired != null
                        ? microphoneRequired
                        : false
        );

        assessment.setFullscreenRequired(
                fullscreenRequired != null
                        ? fullscreenRequired
                        : true
        );

        assessment.setWarningLimit(
                warningLimit != null
                        ? warningLimit
                        : 3
        );

        /*
         * If this is still PUBLISHED, the start time may have
         * changed.
         *
         * Recalculate the future live/expiry schedule.
         */
        if ("PUBLISHED".equalsIgnoreCase(
                assessment.getStatus())) {

            assessment.setLiveAt(
                    assessment.getStartDateTime()
            );

            assessment.setExpiresAt(
                    assessment.getStartDateTime()
                            .plusHours(48)
            );
        }

        AssessmentAssignment saved =
                assessmentRepository.save(assessment);

        /*
         * Existing invited candidates should receive an
         * updated assessment email.
         *
         * We intentionally do this only before LIVE because
         * LIVE assessments cannot be edited.
         */
        sendAssessmentUpdateEmails(saved);

        return saved;
    }

    // =========================================================
    // DELETE ASSESSMENT
    // =========================================================

    @Transactional
    public void deleteAssessment(
            Long userId,
            Long assessmentId) {

        User user = getUser(userId);

        verifyHost(user);

        AssessmentAssignment assessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment not found")
                        );

        verifyAssessmentOwner(
                assessment,
                user
        );

        if (Boolean.TRUE.equals(assessment.getDeleted())) {
            throw new ConflictException(
                    "Assessment is already deleted"
            );
        }

        /*
         * IMPORTANT:
         *
         * We DO NOT physically delete the assessment.
         *
         * Historical results must remain available.
         */
        assessment.setDeleted(true);

        assessment.setDeletedAt(
                LocalDateTime.now()
        );

        assessmentRepository.save(assessment);
    }

    // =========================================================
    // PUBLISH ASSESSMENT
    // =========================================================

    @Transactional
    public AssessmentAssignment publishAssessment(
            Long userId,
            Long assessmentId) {

        User user = getUser(userId);

        verifyHost(user);

        AssessmentAssignment assessment =
                assessmentRepository.findById(assessmentId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment not found")
                        );

        verifyAssessmentOwner(
                assessment,
                user
        );

        if (Boolean.TRUE.equals(assessment.getDeleted())) {

            throw new ConflictException(
                    "This assessment has been deleted"
            );
        }

        /*
         * Only DRAFT assessments can be published.
         */
        if (!"DRAFT".equalsIgnoreCase(
                assessment.getStatus())) {

            throw new ConflictException(
                    "Only draft assessments can be published"
            );
        }

        /*
         * At least one question is required.
         */
        List<AssessmentAssignmentProblem> selectedProblems =
                assessmentProblemRepository
                        .findByAssessmentAssignmentOrderByQuestionOrderAsc(
                                assessment
                        );

        if (selectedProblems == null
                || selectedProblems.isEmpty()) {

            throw new ConflictException(
                    "Please select at least one coding problem before publishing the assessment"
            );
        }

        /*
         * Make sure publicToken exists.
         */
        if (assessment.getPublicToken() == null
                || assessment.getPublicToken().trim().isEmpty()) {

            assessment.setPublicToken(
                    UUID.randomUUID().toString()
            );
        }

        LocalDateTime now =
                LocalDateTime.now();

        LocalDateTime start =
                assessment.getStartDateTime();

        /*
         * 48-hour public availability starts when the
         * assessment actually becomes LIVE.
         */

        if (now.isBefore(start)) {

            /*
             * Scheduled assessment.
             */
            assessment.setStatus("PUBLISHED");

            assessment.setLiveAt(start);

            assessment.setExpiresAt(
                    start.plusHours(48)
            );

        } else {

            /*
             * The global 48-hour window is anchored to the configured
             * scheduled start time, even when publish happens late.
             */
            LocalDateTime expiry = start.plusHours(48);

            assessment.setLiveAt(start);
            assessment.setExpiresAt(expiry);
            assessment.setStatus(
                    now.isBefore(expiry) ? "LIVE" : "EXPIRED"
            );
        }

        return assessmentRepository.save(assessment);
    }

    // =========================================================
    // CHECK WHETHER ASSESSMENT IS CURRENTLY LIVE
    // =========================================================

    public boolean isCurrentlyLive(
            AssessmentAssignment assessment) {

        if (assessment == null) {
            return false;
        }

        if (Boolean.TRUE.equals(
                assessment.getDeleted())) {

            return false;
        }

        if (!"LIVE".equalsIgnoreCase(
                assessment.getStatus())) {

            return false;
        }

        LocalDateTime now =
                LocalDateTime.now();

        if (assessment.getLiveAt() == null
                || assessment.getExpiresAt() == null) {

            return false;
        }

        return !now.isBefore(
                    assessment.getLiveAt()
                )
                && now.isBefore(
                    assessment.getExpiresAt()
                );
    }

    // =========================================================
    // SYNCHRONIZE STATUS
    // =========================================================

    @Transactional
    public void synchronizeStatus(
            AssessmentAssignment assessment) {

        if (assessment == null) {
            return;
        }

        if (Boolean.TRUE.equals(
                assessment.getDeleted())) {

            return;
        }

        String currentStatus =
                assessment.getStatus();

        if (currentStatus == null) {
            return;
        }

        /*
         * DRAFT never automatically becomes LIVE.
         *
         * Host must explicitly publish it.
         */
        if ("DRAFT".equalsIgnoreCase(
                currentStatus)) {

            return;
        }

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * PUBLISHED
         */
        if ("PUBLISHED".equalsIgnoreCase(
                currentStatus)) {

            if (assessment.getStartDateTime() == null) {
                return;
            }

            if (now.isBefore(
                    assessment.getStartDateTime())) {

                return;
            }

            /*
             * Start time reached. The availability window is always
             * scheduledStart -> scheduledStart + 48 hours. If the first
             * synchronization happens after that window, expire directly.
             */
            LocalDateTime scheduledStart = assessment.getStartDateTime();
            LocalDateTime expiry = scheduledStart.plusHours(48);

            assessment.setLiveAt(scheduledStart);
            assessment.setExpiresAt(expiry);
            assessment.setStatus(
                    now.isBefore(expiry) ? "LIVE" : "EXPIRED"
            );

            assessmentRepository.save(assessment);

            return;
        }

        /*
         * LIVE
         */
        if ("LIVE".equalsIgnoreCase(
                currentStatus)) {

            if (assessment.getExpiresAt() == null) {

                /*
                 * Safety recovery for old/live records.
                 */
                LocalDateTime liveTime =
                        assessment.getLiveAt() != null
                                ? assessment.getLiveAt()
                                : now;

                assessment.setLiveAt(liveTime);

                assessment.setExpiresAt(
                        liveTime.plusHours(48)
                );
            }

            if (!now.isBefore(
                    assessment.getExpiresAt())) {

                assessment.setStatus("EXPIRED");

                assessmentRepository.save(
                        assessment
                );
            }

            return;
        }

        /*
         * EXPIRED stays EXPIRED.
         */
        if ("EXPIRED".equalsIgnoreCase(
                currentStatus)) {

            return;
        }
    }

    // =========================================================
    // CHECK WHETHER ASSESSMENT CAN BE EDITED
    // =========================================================

    private boolean isEditable(
            AssessmentAssignment assessment) {

        if (assessment == null) {
            return false;
        }

        if (Boolean.TRUE.equals(
                assessment.getDeleted())) {

            return false;
        }

        String status =
                assessment.getStatus();

        return "DRAFT".equalsIgnoreCase(status)
                || "PUBLISHED".equalsIgnoreCase(status);
    }

    // =========================================================
    // SEND UPDATE EMAILS
    // =========================================================

    private void sendAssessmentUpdateEmails(
            AssessmentAssignment assessment) {

        /*
         * At this point the assessment is still editable,
         * therefore it is DRAFT or PUBLISHED.
         *
         * Only candidates who already received an invitation
         * should receive the update email.
         */

        List<AssessmentInvitation> invitations =
                invitationRepository
                        .findByAssessmentOrderByInvitedAtDesc(
                                assessment
                        );

        if (invitations == null
                || invitations.isEmpty()) {

            return;
        }

        /*
         * IMPORTANT:
         *
         * EmailService currently exposes the invitation email
         * method. Until a dedicated "assessment updated"
         * email method is added, we do not invent a new
         * EmailService method here.
         *
         * The actual update-email template can be added when
         * EmailService is migrated.
         */
    }

    // =========================================================
    // VERIFY HOST
    // =========================================================

    private void verifyHost(User user) {

        AssessmentHostVerification verification =
                verificationRepository
                        .findFirstByUserOrderByRequestedAtDesc(user)
                        .orElse(null);

        if (verification == null) {

            throw new ForbiddenException("You are not verified to host assessments");
        }

        if (!"APPROVED".equals(
                verification.getStatus())) {

            if ("PENDING".equals(
                    verification.getStatus())) {

                throw new ForbiddenException("Your assessment host verification is still pending");
            }

            if ("REJECTED".equals(
                    verification.getStatus())) {

                throw new ForbiddenException("Your assessment host verification was rejected");
            }

            throw new ForbiddenException("You are not verified to host assessments");
        }
    }

    // =========================================================
    // GET USER
    // =========================================================

    private User getUser(Long userId) {

        if (userId == null) {

            throw new BadRequestException("User ID is required");
        }

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found")
                );
    }

    // =========================================================
    // VERIFY ASSESSMENT OWNER
    // =========================================================

    private void verifyAssessmentOwner(
            AssessmentAssignment assessment,
            User user) {

        if (assessment == null
                || user == null
                || assessment.getCreatedBy() == null
                || assessment.getCreatedBy().getId() == null
                || user.getId() == null
                || !assessment.getCreatedBy()
                        .getId()
                        .equals(user.getId())) {

            throw new ForbiddenException("You are not authorized to manage this assessment");
        }
    }

    // =========================================================
    // VALIDATE ASSESSMENT DATA
    // =========================================================

    private void validateAssessmentData(
            String companyName,
            String companyEmail,
            String position,
            LocalDateTime startDateTime,
            Integer durationMinutes,
            Integer warningLimit) {

        if (companyName == null
                || companyName.trim().isEmpty()) {

            throw new BadRequestException("Company name is required");
        }

        if (companyEmail == null
                || companyEmail.trim().isEmpty()) {

            throw new BadRequestException("Company email is required");
        }

        if (!companyEmail.contains("@")
                || !companyEmail.contains(".")) {

            throw new BadRequestException("Please enter a valid company email");
        }

        if (position == null
                || position.trim().isEmpty()) {

            throw new BadRequestException("Position is required");
        }

        if (startDateTime == null) {

            throw new BadRequestException("Assessment start date and time are required");
        }

        if (durationMinutes == null
                || durationMinutes <= 0) {

            throw new BadRequestException("Assessment duration must be greater than zero");
        }

        if (warningLimit == null
                || warningLimit <= 0) {

            throw new BadRequestException("Warning limit must be greater than zero");
        }
    }
}