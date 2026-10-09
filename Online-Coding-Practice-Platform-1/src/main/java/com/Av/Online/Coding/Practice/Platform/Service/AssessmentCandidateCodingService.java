package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateAnswerRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateResultRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.TestCaseRepository;

import com.Av.Online.Coding.Practice.Platform.Service.executor.CCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.CppCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.JavaCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.JavaScriptCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.PythonCodeExecutor;

import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCodeResultResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentSaveAnswerRequest;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentSubmitCodeRequest;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateAnswer;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateResult;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSubmission;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

@Service
public class AssessmentCandidateCodingService {

    private final AssessmentCandidateAnswerRepository answerRepository;
    private final AssessmentCandidateResultRepository resultRepository;
    private final AssessmentCandidateSessionRepository sessionRepository;
    private final AssessmentCandidateSubmissionRepository submissionRepository;
    private final AssessmentAssignmentProblemRepository assignmentProblemRepository;
    private final AssessmentInvitationRepository invitationRepository;
    private final TestCaseRepository testCaseRepository;

    private final JavaCodeExecutor javaCodeExecutor;
    private final CCodeExecutor cCodeExecutor;
    private final CppCodeExecutor cppCodeExecutor;
    private final PythonCodeExecutor pythonCodeExecutor;
    private final JavaScriptCodeExecutor javaScriptCodeExecutor;

    public AssessmentCandidateCodingService(
            AssessmentCandidateAnswerRepository answerRepository,
            AssessmentCandidateResultRepository resultRepository,
            AssessmentCandidateSessionRepository sessionRepository,
            AssessmentCandidateSubmissionRepository submissionRepository,
            AssessmentAssignmentProblemRepository assignmentProblemRepository,
            AssessmentInvitationRepository invitationRepository,
            TestCaseRepository testCaseRepository,
            JavaCodeExecutor javaCodeExecutor,
            CCodeExecutor cCodeExecutor,
            CppCodeExecutor cppCodeExecutor,
            PythonCodeExecutor pythonCodeExecutor,
            JavaScriptCodeExecutor javaScriptCodeExecutor) {

        this.answerRepository = answerRepository;
        this.resultRepository = resultRepository;
        this.sessionRepository = sessionRepository;
        this.submissionRepository = submissionRepository;
        this.assignmentProblemRepository = assignmentProblemRepository;
        this.invitationRepository = invitationRepository;
        this.testCaseRepository = testCaseRepository;

        this.javaCodeExecutor = javaCodeExecutor;
        this.cCodeExecutor = cCodeExecutor;
        this.cppCodeExecutor = cppCodeExecutor;
        this.pythonCodeExecutor = pythonCodeExecutor;
        this.javaScriptCodeExecutor = javaScriptCodeExecutor;
    }

    // =========================================================
    // SAVE ANSWER
    // =========================================================

    @Transactional
    public String saveAnswer(
            String invitationToken,
            AssessmentSaveAnswerRequest request) {

        AssessmentCandidateSession session =
                getValidSession(invitationToken);

        validateRequest(
                request.getAssignmentProblemId(),
                request.getLanguage(),
                request.getCode()
        );

        AssessmentAssignmentProblem assignmentProblem =
                getAssignmentProblem(
                        session,
                        request.getAssignmentProblemId()
                );

        AssessmentCandidateAnswer answer =
                answerRepository
                        .findBySessionAndAssignmentProblem(
                                session,
                                assignmentProblem
                        )
                        .orElse(null);

        String language =
                normalizeLanguage(request.getLanguage());

        if (answer == null) {

            answer =
                    new AssessmentCandidateAnswer(
                            session,
                            assignmentProblem,
                            request.getCode(),
                            language
                    );

        } else {

            answer.setCode(request.getCode());
            answer.setLanguage(language);
            answer.setUpdatedAt(LocalDateTime.now());
        }

        answerRepository.save(answer);

        return "Answer saved successfully";
    }

    // =========================================================
    // SUBMIT CODE
    // =========================================================

    @Transactional
    public AssessmentCodeResultResponse submitCode(
            String invitationToken,
            AssessmentSubmitCodeRequest request) {

        AssessmentCandidateSession session =
                getValidSession(invitationToken);

        validateRequest(
                request.getAssignmentProblemId(),
                request.getLanguage(),
                request.getCode()
        );

        AssessmentAssignmentProblem assignmentProblem =
                getAssignmentProblem(
                        session,
                        request.getAssignmentProblemId()
                );

        List<TestCase> testCases =
                testCaseRepository.findByProblemId(
                        assignmentProblem
                                .getProblem()
                                .getId()
                );

        if (testCases == null || testCases.isEmpty()) {

            throw new ConflictException(
                    "No test cases available for this problem"
            );
        }

        String language =
                normalizeLanguage(request.getLanguage());

        // =====================================================
        // EXECUTE CODE AGAINST ALL TEST CASES
        // =====================================================

        RunCodeResponse response =
                executeCode(
                        language,
                        request.getCode(),
                        testCases
                );

        // =====================================================
        // GET TEST CASE COUNTS FROM EXECUTOR
        // =====================================================

        int totalTestCases =
                response.getTotalTestCases();

        int passedTestCases =
                response.getPassedTestCases();

        int failedTestCases =
                response.getFailedTestCases();

        /*
         * Compilation errors, runtime errors and time-limit errors
         * currently use the old 4-argument RunCodeResponse.
         *
         * In those cases the executor count fields can be 0.
         * Keep the real problem test-case total for persistence/UI.
         */
        if (totalTestCases == 0) {
            totalTestCases = testCases.size();
        }

        // =====================================================
        // CALCULATE RESULT
        // =====================================================

        String status;
        Double marksObtained;

        if (response.isSuccess()) {

            status = "Accepted";

            marksObtained =
                    assignmentProblem.getMarks();

        } else {

            status = response.getStatus();

            if (status == null
                    || status.trim().isEmpty()) {

                status = "Failed";
            }

            marksObtained = 0.0;
        }

        // =====================================================
        // SAVE LATEST ANSWER
        // =====================================================

        AssessmentCandidateAnswer answer =
                answerRepository
                        .findBySessionAndAssignmentProblem(
                                session,
                                assignmentProblem
                        )
                        .orElse(null);

        if (answer == null) {

            answer =
                    new AssessmentCandidateAnswer(
                            session,
                            assignmentProblem,
                            request.getCode(),
                            language
                    );

        } else {

            answer.setCode(request.getCode());
            answer.setLanguage(language);
            answer.setUpdatedAt(LocalDateTime.now());
        }

        answerRepository.save(answer);

        // =====================================================
        // SAVE SUBMISSION HISTORY
        // =====================================================

        AssessmentCandidateSubmission submission =
                new AssessmentCandidateSubmission(
                        session,
                        assignmentProblem,
                        request.getCode(),
                        language
                );

        submission.setStatus(status);

        submission.setPassedTestCases(
                passedTestCases
        );

        submission.setTotalTestCases(
                totalTestCases
        );

        submission.setMarksObtained(
                marksObtained
        );

        submission.setSubmittedAt(
                LocalDateTime.now()
        );

        submissionRepository.save(submission);

        // =====================================================
        // SAVE / UPDATE FINAL QUESTION RESULT
        // =====================================================

        AssessmentCandidateResult result =
                resultRepository
                        .findBySessionAndAssignmentProblem(
                                session,
                                assignmentProblem
                        )
                        .orElse(null);

        if (result == null) {

            result =
                    new AssessmentCandidateResult(
                            session,
                            assignmentProblem
                    );
        }

        result.setCode(request.getCode());

        result.setLanguage(language);

        result.setStatus(status);

        result.setPassedTestCases(
                passedTestCases
        );

        result.setTotalTestCases(
                totalTestCases
        );

        result.setMarksObtained(
                marksObtained
        );

        result.setTotalMarks(
                assignmentProblem.getMarks()
        );

        result.setEvaluatedAt(
                LocalDateTime.now()
        );

        resultRepository.save(result);

        // =====================================================
        // CREATE RESPONSE MESSAGE
        // =====================================================

        String message;

        if (response.isSuccess()) {

            message =
                    "All test cases passed";

        } else {

            message =
                    response.getError();

            if (message == null
                    || message.trim().isEmpty()) {

                message =
                        response.getStatus();
            }

            if (message == null
                    || message.trim().isEmpty()) {

                message =
                        "Code failed during evaluation";
            }
        }

        // =====================================================
        // RETURN RESULT
        // =====================================================

        return new AssessmentCodeResultResponse(
                response.isSuccess(),
                status,
                passedTestCases,
                failedTestCases,
                totalTestCases,
                marksObtained,
                assignmentProblem.getMarks(),
                message
        );
    }

    // =========================================================
    // GET VALID SESSION
    // =========================================================

    private AssessmentCandidateSession getValidSession(
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
        // CHECK ASSESSMENT
        // =====================================================

        if (invitation.getAssessment() == null) {

            throw new ResourceNotFoundException("Assessment not found");
        }

        if (Boolean.TRUE.equals(
                invitation.getAssessment().getDeleted())) {

            throw new ConflictException(
                    "This assessment has been deleted"
            );
        }

        // =====================================================
        // CHECK INVITATION STATUS
        // =====================================================

        if ("COMPLETED".equalsIgnoreCase(
                invitation.getStatus())) {

            throw new ConflictException(
                    "Assessment has already been completed"
            );
        }

        if ("CANCELLED".equalsIgnoreCase(
                invitation.getStatus())) {

            throw new ConflictException(
                    "Assessment invitation has been cancelled"
            );
        }

        // =====================================================
        // FIND SESSION
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

            throw new ConflictException(
                    "Assessment has already been submitted"
            );
        }

        if ("TIME_EXPIRED".equalsIgnoreCase(
                session.getStatus())) {

            throw new ConflictException(
                    "Assessment time has expired"
            );
        }

        // =====================================================
        // CHECK SERVER TIME
        // =====================================================

        LocalDateTime now =
                LocalDateTime.now();

        if (session.getExpiresAt() != null
                && !now.isBefore(
                        session.getExpiresAt())) {

            session.setStatus(
                    "TIME_EXPIRED"
            );

            session.setSubmittedAt(
                    now
            );

            sessionRepository.save(
                    session
            );

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
                    "Assessment time has expired"
            );
        }

        return session;
    }

    // =========================================================
    // GET ASSESSMENT PROBLEM
    // =========================================================

    private AssessmentAssignmentProblem getAssignmentProblem(
            AssessmentCandidateSession session,
            Long assignmentProblemId) {

        AssessmentAssignmentProblem assignmentProblem =
                assignmentProblemRepository
                        .findById(assignmentProblemId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException("Assessment problem not found")
                        );

        AssessmentInvitation invitation =
                session.getInvitation();

        if (invitation == null) {

            throw new ResourceNotFoundException("Assessment invitation not found");
        }

        if (invitation.getAssessment() == null) {

            throw new ResourceNotFoundException("Assessment not found");
        }

        // =====================================================
        // CHECK DIRECT ASSESSMENT OWNERSHIP
        // =====================================================

        if (assignmentProblem.getAssessmentAssignment() == null) {

            throw new ConflictException(
                    "Assessment problem is not assigned to an assessment"
            );
        }

        if (!assignmentProblem
                .getAssessmentAssignment()
                .getId()
                .equals(
                        invitation
                                .getAssessment()
                                .getId()
                )) {

            throw new ConflictException(
                    "This problem does not belong to the assessment"
            );
        }

        return assignmentProblem;
    }

    // =========================================================
    // VALIDATE REQUEST
    // =========================================================

    private void validateRequest(
            Long assignmentProblemId,
            String language,
            String code) {

        if (assignmentProblemId == null) {

            throw new BadRequestException("Assignment problem ID is required");
        }

        if (language == null
                || language.trim().isEmpty()) {

            throw new BadRequestException("Programming language is required");
        }

        if (code == null
                || code.trim().isEmpty()) {

            throw new BadRequestException("Code cannot be empty");
        }
    }

    // =========================================================
    // NORMALIZE LANGUAGE
    // =========================================================

    private String normalizeLanguage(
            String language) {

        return language
                .trim()
                .toLowerCase();
    }

    // =========================================================
    // EXECUTE CODE
    // =========================================================

    private RunCodeResponse executeCode(
            String language,
            String code,
            List<TestCase> testCases) {

        if ("java".equals(language)) {

            return javaCodeExecutor.execute(
                    code,
                    testCases
            );
        }

        if ("c".equals(language)) {

            return cCodeExecutor.execute(
                    code,
                    testCases
            );
        }

        if ("cpp".equals(language)) {

            return cppCodeExecutor.execute(
                    code,
                    testCases
            );
        }

        if ("python".equals(language)) {

            return pythonCodeExecutor.execute(
                    code,
                    testCases
            );
        }

        if ("javascript".equals(language)) {

            return javaScriptCodeExecutor.execute(
                    code,
                    testCases
            );
        }

        throw new BadRequestException("This programming language is not supported yet");
    }
}