package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentSecurityEventRepository;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentSecurityEvent;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentSecurityEventType;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class AssessmentSecurityService {

    private final AssessmentInvitationRepository invitationRepository;
    private final AssessmentCandidateSessionRepository sessionRepository;
    private final AssessmentSecurityEventRepository securityEventRepository;
    private final AssessmentWarningService warningService;
    private final AssessmentCandidateFinalService finalService;

    public AssessmentSecurityService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentCandidateSessionRepository sessionRepository,
            AssessmentSecurityEventRepository securityEventRepository,
            AssessmentWarningService warningService,
            AssessmentCandidateFinalService finalService) {

        this.invitationRepository = invitationRepository;
        this.sessionRepository = sessionRepository;
        this.securityEventRepository = securityEventRepository;
        this.warningService = warningService;
        this.finalService = finalService;
    }

    /*
     * Main server-side entry point for candidate security violations.
     *
     * The browser reports only the event type and optional diagnostic
     * details. It never supplies warningCount, warningLimit or a decision
     * about whether the assessment should be submitted.
     */
    @Transactional
    public SecurityEventResult registerSecurityEvent(
            String invitationToken,
            AssessmentSecurityEventType eventType,
            String details) {

        if (invitationToken == null
                || invitationToken.isBlank()) {

            throw new BadRequestException(
                    "Invitation token is required."
            );
        }

        if (eventType == null) {
            throw new BadRequestException(
                    "Security event type is required."
            );
        }

        AssessmentInvitation invitation =
                invitationRepository
                        .findByInvitationToken(
                                invitationToken.trim()
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invalid assessment invitation."
                                )
                        );

        AssessmentAssignment assessment =
                invitation.getAssessment();

        if (assessment == null) {
            throw new ResourceNotFoundException(
                    "Assessment not found."
            );
        }

        AssessmentCandidateSession session =
                sessionRepository
                        .findByInvitation(invitation)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment candidate session not found."
                                )
                        );

        validateActiveSession(
                invitation,
                session
        );

        LocalDateTime now =
                LocalDateTime.now();

        /*
         * The server timer remains authoritative.
         * If the session has already expired, reuse the existing final
         * submission service instead of creating another scoring path.
         */
        if (session.getExpiresAt() != null
                && !now.isBefore(
                        session.getExpiresAt()
                )) {

            finalService.submitSession(
                    invitation
            );

            saveEvent(
                    session,
                    eventType,
                    false,
                    true,
                    details
            );

            return buildResult(
                    session,
                    true,
                    "Assessment time expired and was submitted automatically."
            );
        }

        return switch (eventType) {

            case TAB_SWITCH ->
                    handleTabSwitch(
                            invitation,
                            session,
                            eventType,
                            details
                    );

            case FULLSCREEN_EXIT ->
                    handleFullscreenExit(
                            invitation,
                            assessment,
                            session,
                            eventType,
                            details
                    );

            case CAMERA_INACTIVE ->
                    handleCameraInactive(
                            invitation,
                            assessment,
                            session,
                            eventType,
                            details
                    );

            case MICROPHONE_INACTIVE ->
                    handleMicrophoneInactive(
                            invitation,
                            assessment,
                            session,
                            eventType,
                            details
                    );
        };
    }

    /*
     * Current project policy:
     * tab switching is treated as a severe violation and causes
     * immediate server-side submission.
     */
    private SecurityEventResult handleTabSwitch(
            AssessmentInvitation invitation,
            AssessmentCandidateSession session,
            AssessmentSecurityEventType eventType,
            String details) {

        saveEvent(
                session,
                eventType,
                false,
                true,
                details
        );

        finalService.submitSession(
                invitation
        );

        return buildResult(
                session,
                true,
                "Assessment submitted because a tab-switch violation was detected."
        );
    }

    private SecurityEventResult handleFullscreenExit(
            AssessmentInvitation invitation,
            AssessmentAssignment assessment,
            AssessmentCandidateSession session,
            AssessmentSecurityEventType eventType,
            String details) {

        session.setFullscreenActive(false);
        sessionRepository.save(session);

        if (!Boolean.TRUE.equals(
                assessment.getFullscreenRequired()
        )) {

            saveEvent(
                    session,
                    eventType,
                    false,
                    false,
                    details
            );

            return buildResult(
                    session,
                    false,
                    "Fullscreen is not required for this assessment."
            );
        }

        return issueWarning(
                invitation,
                session,
                eventType,
                details,
                "Fullscreen exit recorded."
        );
    }

    private SecurityEventResult handleCameraInactive(
            AssessmentInvitation invitation,
            AssessmentAssignment assessment,
            AssessmentCandidateSession session,
            AssessmentSecurityEventType eventType,
            String details) {

        session.setCameraActive(false);
        sessionRepository.save(session);

        if (!Boolean.TRUE.equals(
                assessment.getCameraRequired()
        )) {

            saveEvent(
                    session,
                    eventType,
                    false,
                    false,
                    details
            );

            return buildResult(
                    session,
                    false,
                    "Camera is not required for this assessment."
            );
        }

        return issueWarning(
                invitation,
                session,
                eventType,
                details,
                "Camera inactivity warning recorded."
        );
    }

    private SecurityEventResult handleMicrophoneInactive(
            AssessmentInvitation invitation,
            AssessmentAssignment assessment,
            AssessmentCandidateSession session,
            AssessmentSecurityEventType eventType,
            String details) {

        session.setMicrophoneActive(false);
        sessionRepository.save(session);

        if (!Boolean.TRUE.equals(
                assessment.getMicrophoneRequired()
        )) {

            saveEvent(
                    session,
                    eventType,
                    false,
                    false,
                    details
            );

            return buildResult(
                    session,
                    false,
                    "Microphone is not required for this assessment."
            );
        }

        return issueWarning(
                invitation,
                session,
                eventType,
                details,
                "Microphone inactivity warning recorded."
        );
    }

    private SecurityEventResult issueWarning(
            AssessmentInvitation invitation,
            AssessmentCandidateSession session,
            AssessmentSecurityEventType eventType,
            String details,
            String message) {

        boolean warningLimitReached =
                warningService.registerWarning(
                        session
                );

        if (warningLimitReached) {

            saveEvent(
                    session,
                    eventType,
                    true,
                    true,
                    details
            );

            finalService.submitSession(
                    invitation
            );

            return buildResult(
                    session,
                    true,
                    "Security warning limit reached. Assessment submitted automatically."
            );
        }

        saveEvent(
                session,
                eventType,
                true,
                false,
                details
        );

        return buildResult(
                session,
                false,
                message
        );
    }

    private void saveEvent(
            AssessmentCandidateSession session,
            AssessmentSecurityEventType eventType,
            boolean warningIssued,
            boolean autoSubmitted,
            String details) {

        AssessmentSecurityEvent event =
                new AssessmentSecurityEvent(
                        session,
                        eventType,
                        LocalDateTime.now(),
                        warningIssued,
                        autoSubmitted,
                        sanitizeDetails(details)
                );

        securityEventRepository.save(
                event
        );
    }

    private String sanitizeDetails(
            String details) {

        if (details == null
                || details.isBlank()) {

            return null;
        }

        String value =
                details.trim();

        if (value.length() > 500) {
            return value.substring(
                    0,
                    500
            );
        }

        return value;
    }

    private void validateActiveSession(
            AssessmentInvitation invitation,
            AssessmentCandidateSession session) {

        if ("COMPLETED".equalsIgnoreCase(
                invitation.getStatus()
        )) {

            throw new ConflictException(
                    "Assessment has already been completed."
            );
        }

        String status =
                session.getStatus();

        if (!"IN_PROGRESS".equalsIgnoreCase(
                status
        )) {

            throw new ConflictException(
                    "Assessment session is not active."
            );
        }
    }

    private SecurityEventResult buildResult(
            AssessmentCandidateSession session,
            boolean autoSubmitted,
            String message) {

        return new SecurityEventResult(
                warningService.getWarningCount(
                        session
                ),
                warningService.getWarningLimit(
                        session
                ),
                autoSubmitted,
                message
        );
    }

    public record SecurityEventResult(
            int warningCount,
            int warningLimit,
            boolean autoSubmitted,
            String message) {
    }
}
