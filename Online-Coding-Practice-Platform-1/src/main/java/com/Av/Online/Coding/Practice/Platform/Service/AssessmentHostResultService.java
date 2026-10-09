package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateResultRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentHostVerificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;

import com.Av.Online.Coding.Practice.Platform.dto.AssessmentHostQuestionResultResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentHostResultDetailResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentHostResultSummaryResponse;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateResult;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostVerification;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.entity.User;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class AssessmentHostResultService {

    private final AssessmentInvitationRepository invitationRepository;

    private final AssessmentCandidateSessionRepository sessionRepository;

    private final AssessmentCandidateResultRepository resultRepository;

    private final AssessmentAssignmentProblemRepository assignmentProblemRepository;

    private final AssessmentAssignmentRepository assessmentRepository;

    private final AssessmentHostVerificationRepository verificationRepository;

    private final UserRepository userRepository;


    public AssessmentHostResultService(
            AssessmentInvitationRepository invitationRepository,
            AssessmentCandidateSessionRepository sessionRepository,
            AssessmentCandidateResultRepository resultRepository,
            AssessmentAssignmentProblemRepository assignmentProblemRepository,
            AssessmentAssignmentRepository assessmentRepository,
            AssessmentHostVerificationRepository verificationRepository,
            UserRepository userRepository) {

        this.invitationRepository = invitationRepository;
        this.sessionRepository = sessionRepository;
        this.resultRepository = resultRepository;
        this.assignmentProblemRepository = assignmentProblemRepository;
        this.assessmentRepository = assessmentRepository;
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
    }


    // =========================================================
    // GET ALL CANDIDATE RESULTS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AssessmentHostResultSummaryResponse> getAssessmentResults(
            Long userId,
            Long assessmentId) {

        User user = getUser(userId);

        verifyHost(user);

        AssessmentAssignment assessment =
                getAssessment(assessmentId);

        verifyAssessmentOwner(
                assessment,
                user
        );

        List<AssessmentInvitation> invitations =
                invitationRepository
                        .findByAssessmentOrderByInvitedAtDesc(
                                assessment
                        );

        List<AssessmentHostResultSummaryResponse> responses =
                new ArrayList<>();

        List<AssessmentAssignmentProblem> problems =
                getProblemsForAssessment(assessment);

        double totalMarks =
                calculateTotalMarks(problems);

        for (AssessmentInvitation invitation : invitations) {

            AssessmentCandidateSession session =
                    sessionRepository
                            .findByInvitation(invitation)
                            .orElse(null);

            Double marksObtained = 0.0;

            Integer attemptedQuestions = 0;

            Integer solvedQuestions = 0;

            if (session != null) {

                List<AssessmentCandidateResult> results =
                        resultRepository
                                .findBySessionOrderByAssignmentProblem_QuestionOrderAsc(
                                        session
                                );

                for (AssessmentCandidateResult result : results) {

                    if (!belongsToProblems(
                            result,
                            problems
                    )) {
                        continue;
                    }

                    attemptedQuestions++;

                    marksObtained +=
                            safeDouble(
                                    result.getMarksObtained()
                            );

                    if ("Accepted".equalsIgnoreCase(
                            result.getStatus())) {

                        solvedQuestions++;
                    }
                }
            }

            Double percentage =
                    calculatePercentage(
                            marksObtained,
                            totalMarks
                    );

            String status =
                    getCandidateStatus(
                            invitation,
                            session
                    );

            LocalDateTime startedAt =
                    session != null
                            ? session.getStartedAt()
                            : invitation.getStartedAt();

            LocalDateTime submittedAt =
                    session != null
                            ? session.getSubmittedAt()
                            : invitation.getCompletedAt();

            responses.add(
                    new AssessmentHostResultSummaryResponse(
                            invitation.getId(),

                            session != null
                                    ? session.getId()
                                    : null,

                            assessment.getId(),

                            invitation.getCandidateName(),

                            invitation.getCandidateEmail(),

                            status,

                            marksObtained,

                            totalMarks,

                            percentage,

                            problems.size(),

                            attemptedQuestions,

                            solvedQuestions,

                            invitation.getInvitedAt(),

                            startedAt,

                            submittedAt
                    )
            );
        }

        return responses;
    }


    // =========================================================
    // GET ONE CANDIDATE RESULT
    // =========================================================

    @Transactional(readOnly = true)
    public AssessmentHostResultDetailResponse getCandidateResult(
            Long userId,
            Long assessmentId,
            Long invitationId) {

        User user = getUser(userId);

        verifyHost(user);

        AssessmentAssignment assessment =
                getAssessment(assessmentId);

        verifyAssessmentOwner(
                assessment,
                user
        );

        AssessmentInvitation invitation =
                invitationRepository
                        .findById(invitationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invitation not found"
                                )
                        );

        if (invitation.getAssessment() == null
                || !invitation
                        .getAssessment()
                        .getId()
                        .equals(assessment.getId())) {

            throw new ResourceNotFoundException(
                    "This candidate does not belong to this assessment"
            );
        }


        // =====================================================
        // QUESTIONS DIRECTLY BELONG TO ASSESSMENT
        // =====================================================

        List<AssessmentAssignmentProblem> problems =
                getProblemsForAssessment(assessment);

        double totalMarks =
                calculateTotalMarks(problems);

        AssessmentCandidateSession session =
                sessionRepository
                        .findByInvitation(invitation)
                        .orElse(null);

        double marksObtained = 0.0;

        int attemptedQuestions = 0;

        int solvedQuestions = 0;

        List<AssessmentHostQuestionResultResponse> questionResponses =
                new ArrayList<>();

        List<AssessmentCandidateResult> results =
                session != null
                        ? resultRepository
                                .findBySessionOrderByAssignmentProblem_QuestionOrderAsc(
                                        session
                                )
                        : new ArrayList<>();


        // =====================================================
        // BUILD QUESTION RESULTS
        // =====================================================

        for (AssessmentAssignmentProblem problem : problems) {

            AssessmentCandidateResult result =
                    findResult(
                            results,
                            problem
                    );

            if (result != null) {

                attemptedQuestions++;

                marksObtained +=
                        safeDouble(
                                result.getMarksObtained()
                        );

                if ("Accepted".equalsIgnoreCase(
                        result.getStatus())) {

                    solvedQuestions++;
                }
            }

            questionResponses.add(
                    buildQuestionResponse(
                            problem,
                            result
                    )
            );
        }


        Double percentage =
                calculatePercentage(
                        marksObtained,
                        totalMarks
                );

        String status =
                getCandidateStatus(
                        invitation,
                        session
                );


        // =====================================================
        // SESSION SECURITY STATE
        // =====================================================

        Integer warningCount =
                session != null
                        && session.getWarningCount() != null
                                ? session.getWarningCount()
                                : 0;

        Boolean cameraActive =
                session != null
                        && session.getCameraActive() != null
                                ? session.getCameraActive()
                                : false;

        Boolean microphoneActive =
                session != null
                        && session.getMicrophoneActive() != null
                                ? session.getMicrophoneActive()
                                : false;

        Boolean fullscreenActive =
                session != null
                        && session.getFullscreenActive() != null
                                ? session.getFullscreenActive()
                                : false;


        // =====================================================
        // ASSESSMENT SECURITY REQUIREMENTS
        // =====================================================
        //
        // These values come directly from the assessment
        // configuration stored in assessment_assignments.
        //
        // They are intentionally separate from the session
        // "Active" values above.
        //

        Boolean cameraRequired =
                Boolean.TRUE.equals(
                        assessment.getCameraRequired()
                );

        Boolean microphoneRequired =
                Boolean.TRUE.equals(
                        assessment.getMicrophoneRequired()
                );

        Boolean fullscreenRequired =
                Boolean.TRUE.equals(
                        assessment.getFullscreenRequired()
                );


        // =====================================================
        // TIMELINE
        // =====================================================

        LocalDateTime startedAt =
                session != null
                        ? session.getStartedAt()
                        : invitation.getStartedAt();

        LocalDateTime submittedAt =
                session != null
                        ? session.getSubmittedAt()
                        : invitation.getCompletedAt();


        // =====================================================
        // FINAL RESPONSE
        // =====================================================

        return new AssessmentHostResultDetailResponse(

                invitation.getId(),

                session != null
                        ? session.getId()
                        : null,

                assessment.getId(),

                assessment.getCompanyName(),

                assessment.getCompanyEmail(),

                assessment.getPosition(),

                invitation.getCandidateName(),

                invitation.getCandidateEmail(),

                status,

                totalMarks,

                marksObtained,

                percentage,

                problems.size(),

                attemptedQuestions,

                solvedQuestions,

                invitation.getInvitedAt(),

                startedAt,

                submittedAt,

                warningCount,

                /*
                 * Assessment security requirements
                 */
                cameraRequired,

                microphoneRequired,

                fullscreenRequired,

                /*
                 * Candidate session security state
                 */
                cameraActive,

                microphoneActive,

                fullscreenActive,

                questionResponses
        );
    }


    // =========================================================
    // GET QUESTIONS FOR ASSESSMENT
    // =========================================================

    private List<AssessmentAssignmentProblem> getProblemsForAssessment(
            AssessmentAssignment assessment) {

        return assignmentProblemRepository
                .findByAssessmentAssignmentOrderByQuestionOrderAsc(
                        assessment
                );
    }


    // =========================================================
    // CHECK RESULT BELONGS TO ASSESSMENT QUESTIONS
    // =========================================================

    private boolean belongsToProblems(
            AssessmentCandidateResult result,
            List<AssessmentAssignmentProblem> problems) {

        if (result == null
                || result.getAssignmentProblem() == null
                || result.getAssignmentProblem().getId() == null) {

            return false;
        }

        Long resultProblemId =
                result.getAssignmentProblem().getId();

        for (AssessmentAssignmentProblem problem : problems) {

            if (problem.getId() != null
                    && problem.getId().equals(resultProblemId)) {

                return true;
            }
        }

        return false;
    }


    // =========================================================
    // BUILD QUESTION RESULT
    // =========================================================

    private AssessmentHostQuestionResultResponse buildQuestionResponse(
            AssessmentAssignmentProblem problem,
            AssessmentCandidateResult result) {

        if (result == null) {

            return new AssessmentHostQuestionResultResponse(
                    problem.getId(),
                    problem.getProblem().getId(),
                    problem.getQuestionOrder(),
                    problem.getProblem().getTitle(),
                    problem.getProblem().getDifficulty(),
                    problem.getProblem().getCategory(),
                    problem.getMarks(),
                    0.0,
                    "Not Attempted",
                    0,
                    0,
                    null,
                    null
            );
        }

        return new AssessmentHostQuestionResultResponse(
                problem.getId(),
                problem.getProblem().getId(),
                problem.getQuestionOrder(),
                problem.getProblem().getTitle(),
                problem.getProblem().getDifficulty(),
                problem.getProblem().getCategory(),
                problem.getMarks(),
                safeDouble(
                        result.getMarksObtained()
                ),
                result.getStatus(),
                result.getPassedTestCases(),
                result.getTotalTestCases(),
                result.getLanguage(),
                result.getCode()
        );
    }


    // =========================================================
    // FIND RESULT FOR QUESTION
    // =========================================================

    private AssessmentCandidateResult findResult(
            List<AssessmentCandidateResult> results,
            AssessmentAssignmentProblem problem) {

        for (AssessmentCandidateResult result : results) {

            if (result.getAssignmentProblem() != null
                    && result.getAssignmentProblem().getId() != null
                    && result.getAssignmentProblem()
                            .getId()
                            .equals(problem.getId())) {

                return result;
            }
        }

        return null;
    }


    // =========================================================
    // CANDIDATE STATUS
    // =========================================================

    private String getCandidateStatus(
            AssessmentInvitation invitation,
            AssessmentCandidateSession session) {

        if (session != null
                && session.getStatus() != null) {

            return session.getStatus();
        }

        if (invitation.getStatus() != null) {

            return invitation.getStatus();
        }

        return "INVITED";
    }


    // =========================================================
    // TOTAL MARKS
    // =========================================================

    private double calculateTotalMarks(
            List<AssessmentAssignmentProblem> problems) {

        double total = 0.0;

        for (AssessmentAssignmentProblem problem : problems) {

            total += safeDouble(
                    problem.getMarks()
            );
        }

        return total;
    }


    // =========================================================
    // PERCENTAGE
    // =========================================================

    private Double calculatePercentage(
            double marksObtained,
            double totalMarks) {

        if (totalMarks <= 0) {

            return 0.0;
        }

        double percentage =
                (marksObtained / totalMarks) * 100.0;

        return Math.round(
                percentage * 100.0
        ) / 100.0;
    }


    // =========================================================
    // SAFE DOUBLE
    // =========================================================

    private double safeDouble(Double value) {

        return value != null
                ? value
                : 0.0;
    }


    // =========================================================
    // GET ASSESSMENT
    // =========================================================

    private AssessmentAssignment getAssessment(
            Long assessmentId) {

        return assessmentRepository
                .findById(assessmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Assessment not found"
                        )
                );
    }


    // =========================================================
    // VERIFY HOST
    // =========================================================

    private void verifyHost(User user) {

        AssessmentHostVerification verification =
                verificationRepository
                        .findFirstByUserOrderByRequestedAtDesc(
                                user
                        )
                        .orElse(null);

        if (verification == null) {

            throw new ForbiddenException(
                    "You are not verified to host assessments"
            );
        }

        if (!"APPROVED".equalsIgnoreCase(
                verification.getStatus())) {

            throw new ForbiddenException(
                    "Your assessment host verification is not approved"
            );
        }
    }


    // =========================================================
    // VERIFY OWNER
    // =========================================================

    private void verifyAssessmentOwner(
            AssessmentAssignment assessment,
            User user) {

        if (assessment.getCreatedBy() == null
                || assessment.getCreatedBy().getId() == null
                || !assessment.getCreatedBy()
                        .getId()
                        .equals(user.getId())) {

            throw new ForbiddenException(
                    "You are not authorized to view this assessment"
            );
        }
    }


    // =========================================================
    // GET USER
    // =========================================================

    private User getUser(Long userId) {

        if (userId == null) {

            throw new BadRequestException(
                    "User ID is required"
            );
        }

        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }
}