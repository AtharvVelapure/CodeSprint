package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentAssignmentProblemResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.User;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class AssessmentAssignmentProblemService {

    private final AssessmentAssignmentRepository assessmentRepository;
    private final AssessmentAssignmentProblemRepository assessmentProblemRepository;
    private final ProblemRepository problemRepository;
    private final UserRepository userRepository;

    public AssessmentAssignmentProblemService(
            AssessmentAssignmentRepository assessmentRepository,
            AssessmentAssignmentProblemRepository assessmentProblemRepository,
            ProblemRepository problemRepository,
            UserRepository userRepository) {

        this.assessmentRepository = assessmentRepository;
        this.assessmentProblemRepository = assessmentProblemRepository;
        this.problemRepository = problemRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // ADD PROBLEM
    // =========================================================

    @Transactional
    public AssessmentAssignmentProblemResponse addProblem(
            Long userId,
            Long assessmentId,
            Long problemId,
            Integer questionOrder,
            Double marks) {

        User user = getUser(userId);

        AssessmentAssignment assessment =
                getAssessment(assessmentId);

        verifyAssessmentOwner(assessment, user);
        validateAssessmentCanBeEdited(assessment);
        validateQuestionOrder(questionOrder);
        validateMarks(marks);

        Problem problem =
                problemRepository.findById(problemId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Problem not found"
                                )
                        );

        // Only normal CodeSprint problems can be used
        if (problem.getSource() == null
                || !"NORMAL".equalsIgnoreCase(problem.getSource())) {

            throw new BadRequestException(
                    "Only normal CodeSprint problems can be added to an assessment"
            );
        }

        // Prevent duplicate problem
        boolean alreadyAdded =
                assessmentProblemRepository
                        .existsByAssessmentAssignmentAndProblem(
                                assessment,
                                problem
                        );

        if (alreadyAdded) {
            throw new ConflictException(
                    "This problem is already added to this assessment"
            );
        }

        AssessmentAssignmentProblem assessmentProblem =
                new AssessmentAssignmentProblem(
                        assessment,
                        problem,
                        questionOrder,
                        marks
                );

        AssessmentAssignmentProblem saved =
                assessmentProblemRepository.save(
                        assessmentProblem
                );

        /*
         * Convert to DTO while transaction is active.
         * This prevents lazy-loading serialization problems.
         */
        return toResponse(saved);
    }

    // =========================================================
    // GET ASSESSMENT PROBLEMS
    // =========================================================

    @Transactional(readOnly = true)
    public List<AssessmentAssignmentProblemResponse> getAssessmentProblems(
            Long userId,
            Long assessmentId) {

        User user = getUser(userId);

        AssessmentAssignment assessment =
                getAssessment(assessmentId);

        verifyAssessmentOwner(
                assessment,
                user
        );

        List<AssessmentAssignmentProblem> assessmentProblems =
                assessmentProblemRepository
                        .findByAssessmentAssignmentOrderByQuestionOrderAsc(
                                assessment
                        );

        /*
         * Map entities to DTOs before leaving transaction.
         */
        return assessmentProblems.stream()
                .map(this::toResponse)
                .toList();
    }

    // =========================================================
    // UPDATE PROBLEM
    // =========================================================

    @Transactional
    public AssessmentAssignmentProblemResponse updateProblem(
            Long userId,
            Long assessmentProblemId,
            Integer questionOrder,
            Double marks) {

        User user = getUser(userId);

        AssessmentAssignmentProblem assessmentProblem =
                assessmentProblemRepository
                        .findById(assessmentProblemId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment problem not found"
                                )
                        );

        AssessmentAssignment assessment =
                assessmentProblem.getAssessmentAssignment();

        verifyAssessmentOwner(
                assessment,
                user
        );

        validateAssessmentCanBeEdited(
                assessment
        );

        validateQuestionOrder(
                questionOrder
        );

        validateMarks(
                marks
        );

        assessmentProblem.setQuestionOrder(
                questionOrder
        );

        assessmentProblem.setMarks(
                marks
        );

        AssessmentAssignmentProblem saved =
                assessmentProblemRepository.save(
                        assessmentProblem
                );

        /*
         * Return DTO instead of JPA entity.
         */
        return toResponse(saved);
    }

    // =========================================================
    // REMOVE PROBLEM
    // =========================================================

    @Transactional
    public void removeProblem(
            Long userId,
            Long assessmentProblemId) {

        User user = getUser(userId);

        AssessmentAssignmentProblem assessmentProblem =
                assessmentProblemRepository
                        .findById(assessmentProblemId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment problem not found"
                                )
                        );

        AssessmentAssignment assessment =
                assessmentProblem.getAssessmentAssignment();

        verifyAssessmentOwner(
                assessment,
                user
        );

        validateAssessmentCanBeEdited(
                assessment
        );

        /*
         * Only remove the mapping between assessment and problem.
         * Do NOT delete the actual coding problem.
         */
        assessmentProblemRepository.delete(
                assessmentProblem
        );
    }

    // =========================================================
    // ENTITY -> DTO
    // =========================================================

    private AssessmentAssignmentProblemResponse toResponse(
            AssessmentAssignmentProblem assessmentProblem) {

        /*
         * Problem is LAZY.
         *
         * This method is called while the transaction/session
         * is still active.
         */
        Problem problem =
                assessmentProblem.getProblem();

        AssessmentAssignmentProblemResponse.ProblemSummary problemSummary =
                new AssessmentAssignmentProblemResponse.ProblemSummary(
                        problem.getId(),
                        problem.getTitle(),
                        problem.getCategory(),
                        problem.getDifficulty()
                );

        return new AssessmentAssignmentProblemResponse(
                assessmentProblem.getId(),
                assessmentProblem.getQuestionOrder(),
                assessmentProblem.getMarks(),
                problemSummary
        );
    }

    // =========================================================
    // VALIDATE ASSESSMENT STATE
    // =========================================================

    private void validateAssessmentCanBeEdited(
            AssessmentAssignment assessment) {

        if (assessment == null) {
            throw new ResourceNotFoundException(
                    "Assessment not found"
            );
        }

        if (Boolean.TRUE.equals(assessment.getDeleted())) {
            throw new ConflictException(
                    "This assessment has been deleted"
            );
        }

        String status =
                assessment.getStatus();

        if (status == null) {
            return;
        }

        if ("LIVE".equalsIgnoreCase(status)) {
            throw new ConflictException(
                    "Assessment is currently LIVE. Questions cannot be added, edited, or deleted."
            );
        }

        if ("EXPIRED".equalsIgnoreCase(status)) {
            throw new ConflictException(
                    "This assessment has expired. Questions cannot be added, edited, or deleted."
            );
        }

        if ("DRAFT".equalsIgnoreCase(status)
                || "PUBLISHED".equalsIgnoreCase(status)) {

            return;
        }

        throw new ConflictException(
                "Questions cannot be modified in the current assessment state: "
                        + status
        );
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

    // =========================================================
    // GET ASSESSMENT
    // =========================================================

    private AssessmentAssignment getAssessment(
            Long assessmentId) {

        if (assessmentId == null) {
            throw new BadRequestException(
                    "Assessment ID is required"
            );
        }

        return assessmentRepository
                .findById(assessmentId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Assessment not found"
                        )
                );
    }

    // =========================================================
    // VERIFY ASSESSMENT OWNER
    // =========================================================

    private void verifyAssessmentOwner(
            AssessmentAssignment assessment,
            User user) {

        if (assessment.getCreatedBy() == null
                || assessment.getCreatedBy().getId() == null
                || user.getId() == null
                || !assessment.getCreatedBy()
                        .getId()
                        .equals(user.getId())) {

            throw new ForbiddenException(
                    "You are not authorized to manage this assessment"
            );
        }
    }

    // =========================================================
    // VALIDATE QUESTION ORDER
    // =========================================================

    private void validateQuestionOrder(
            Integer questionOrder) {

        if (questionOrder == null
                || questionOrder <= 0) {

            throw new BadRequestException(
                    "Question order must be greater than zero"
            );
        }
    }

    // =========================================================
    // VALIDATE MARKS
    // =========================================================

    private void validateMarks(
            Double marks) {

        if (marks == null
                || marks <= 0) {

            throw new BadRequestException(
                    "Marks must be greater than zero"
            );
        }
    }
}