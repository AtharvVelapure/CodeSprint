package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.CertificateRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationAttemptRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationQuestionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.TestCaseRepository;

import com.Av.Online.Coding.Practice.Platform.dto.CertificationQuestionRequest;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationQuestionResponse;
import com.Av.Online.Coding.Practice.Platform.dto.CustomProblemUpdateRequest;

import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationQuestion;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;

@Service
@Transactional
public class AdminCertificationQuestionService {

    private final CertificationQuestionRepository questionRepository;

    private final CertificationRepository certificationRepository;

    private final ProblemRepository problemRepository;

    private final CertificationAttemptRepository attemptRepository;

    private final CertificateRepository certificateRepository;

    private final TestCaseRepository testCaseRepository;

    public AdminCertificationQuestionService(
            CertificationQuestionRepository questionRepository,
            CertificationRepository certificationRepository,
            ProblemRepository problemRepository,
            CertificationAttemptRepository attemptRepository,
            CertificateRepository certificateRepository,
            TestCaseRepository testCaseRepository) {

        this.questionRepository = questionRepository;
        this.certificationRepository = certificationRepository;
        this.problemRepository = problemRepository;
        this.attemptRepository = attemptRepository;
        this.certificateRepository = certificateRepository;
        this.testCaseRepository = testCaseRepository;
    }

    // ============================================================
    // ADD EXISTING PROBLEM TO CERTIFICATION
    // ============================================================

    public CertificationQuestionResponse addQuestion(
            Long certificationId,
            CertificationQuestionRequest request) {

        Certification certification =
                certificationRepository.findById(certificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification not found"
                                )
                        );

        // ========================================================
        // VALIDATE QUESTION LIMIT
        // ========================================================

        validateQuestionLimit(certification);

        // ========================================================
        // VALIDATE REQUEST
        // ========================================================

        if (request == null) {
            throw new BadRequestException(
                    "Question data is required"
            );
        }

        if (request.getProblemId() == null) {
            throw new BadRequestException(
                    "Problem is required"
            );
        }

        if (request.getQuestionOrder() == null
                || request.getQuestionOrder() <= 0) {

            throw new ConflictException(
                    "Question order must be greater than zero"
            );
        }

        if (request.getPercentageWeight() == null
                || request.getPercentageWeight() <= 0) {

            throw new BadRequestException(
                    "Percentage weight must be greater than zero"
            );
        }

        if (request.getPercentageWeight() > 100) {

            throw new BadRequestException(
                    "Percentage weight cannot be greater than 100"
            );
        }

        // ========================================================
        // FIND PROBLEM FROM DATABASE
        // ========================================================

        Problem problem =
                problemRepository.findById(
                        request.getProblemId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Problem not found"
                        )
                );

        // ========================================================
        // ONLY NORMAL PROBLEMS ALLOWED
        // ========================================================

        if (!"NORMAL".equals(problem.getSource())) {

            throw new BadRequestException(
                    "This problem is certification-only and cannot be added through the existing problem flow"
            );
        }

        // ========================================================
        // DUPLICATE PROBLEM
        // ========================================================

        validateDuplicateProblem(
                certification,
                problem
        );

        // ========================================================
        // DUPLICATE QUESTION ORDER
        // ========================================================

        validateDuplicateQuestionOrder(
                certification,
                request.getQuestionOrder()
        );

        // ========================================================
        // VALIDATE TOTAL WEIGHT
        // ========================================================

        validateTotalWeightForNewQuestion(
                certification,
                request.getPercentageWeight()
        );

        // ========================================================
        // CREATE CERTIFICATION QUESTION
        // ========================================================

        CertificationQuestion question =
                new CertificationQuestion();

        question.setCertification(
                certification
        );

        question.setProblem(
                problem
        );

        question.setQuestionOrder(
                request.getQuestionOrder()
        );

        question.setPercentageWeight(
                request.getPercentageWeight()
        );

        // ========================================================
        // SAVE
        // ========================================================

        CertificationQuestion savedQuestion =
                questionRepository.save(
                        question
                );

        return mapToResponse(
                savedQuestion
        );
    }

    // ============================================================
    // CREATE CUSTOM CERTIFICATION PROBLEM
    // ============================================================

    public CertificationQuestionResponse addCustomProblem(
            Long certificationId,
            Problem customProblem,
            Integer questionOrder,
            Double percentageWeight) {

        Certification certification =
                certificationRepository.findById(certificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification not found"
                                )
                        );

        // ========================================================
        // VALIDATE QUESTION LIMIT
        // ========================================================

        validateQuestionLimit(certification);

        // ========================================================
        // VALIDATE CUSTOM PROBLEM
        // ========================================================

        validateCustomProblem(customProblem);

        // ========================================================
        // VALIDATE QUESTION ORDER
        // ========================================================

        if (questionOrder == null
                || questionOrder <= 0) {

            throw new ConflictException(
                    "Question order must be greater than zero"
            );
        }

        validateDuplicateQuestionOrder(
                certification,
                questionOrder
        );

        // ========================================================
        // VALIDATE WEIGHT
        // ========================================================

        if (percentageWeight == null
                || percentageWeight <= 0) {

            throw new BadRequestException(
                    "Percentage weight must be greater than zero"
            );
        }

        if (percentageWeight > 100) {

            throw new BadRequestException(
                    "Percentage weight cannot be greater than 100"
            );
        }

        validateTotalWeightForNewQuestion(
                certification,
                percentageWeight
        );

        // ========================================================
        // CREATE CERTIFICATION-ONLY PROBLEM
        // ========================================================

        customProblem.setId(null);

        customProblem.setSource(
                "CERTIFICATION_ONLY"
        );

        Problem savedProblem =
                problemRepository.save(
                        customProblem
                );

        // ========================================================
        // CREATE CERTIFICATION QUESTION
        // ========================================================

        CertificationQuestion certificationQuestion =
                new CertificationQuestion();

        certificationQuestion.setCertification(
                certification
        );

        certificationQuestion.setProblem(
                savedProblem
        );

        certificationQuestion.setQuestionOrder(
                questionOrder
        );

        certificationQuestion.setPercentageWeight(
                percentageWeight
        );

        CertificationQuestion savedQuestion =
                questionRepository.save(
                        certificationQuestion
                );

        return mapToResponse(
                savedQuestion
        );
    }

    // ============================================================
    // GET ALL CODING QUESTIONS
    // ============================================================

    @Transactional(readOnly = true)
    public List<CertificationQuestionResponse> getQuestions(
            Long certificationId) {

        Certification certification =
                certificationRepository.findById(certificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification not found"
                                )
                        );

        return questionRepository
                .findByCertificationOrderByQuestionOrderAsc(
                        certification
                )
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET QUESTION BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public CertificationQuestionResponse getQuestion(
            Long questionId) {

        CertificationQuestion question =
                questionRepository.findById(questionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Question not found"
                                )
                        );

        return mapToResponse(question);
    }

    // ============================================================
    // UPDATE CODING QUESTION
    // ============================================================

    public CertificationQuestionResponse updateQuestion(
            Long questionId,
            CertificationQuestionRequest request) {

        // ========================================================
        // FIND EXISTING QUESTION
        // ========================================================

        CertificationQuestion existingQuestion =
                questionRepository.findById(questionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Question not found"
                                )
                        );

        // ========================================================
        // VALIDATE REQUEST
        // ========================================================

        if (request == null) {

            throw new BadRequestException(
                    "Question data is required"
            );
        }

        if (request.getProblemId() == null) {

            throw new BadRequestException(
                    "Problem is required"
            );
        }

        if (request.getQuestionOrder() == null
                || request.getQuestionOrder() <= 0) {

            throw new ConflictException(
                    "Question order must be greater than zero"
            );
        }

        if (request.getPercentageWeight() == null
                || request.getPercentageWeight() <= 0) {

            throw new BadRequestException(
                    "Percentage weight must be greater than zero"
            );
        }

        if (request.getPercentageWeight() > 100) {

            throw new BadRequestException(
                    "Percentage weight cannot be greater than 100"
            );
        }

        // ========================================================
        // FIND PROBLEM
        // ========================================================

        Problem problem =
                problemRepository.findById(
                        request.getProblemId()
                )
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Problem not found"
                        )
                );

        // ========================================================
        // GET CERTIFICATION
        // ========================================================

        Certification certification =
                existingQuestion.getCertification();

        // ========================================================
        // DUPLICATE PROBLEM
        // ========================================================

        if (questionRepository
                .existsByCertificationAndProblem(
                        certification,
                        problem
                )) {

            CertificationQuestion problemQuestion =
                    questionRepository
                            .findByCertificationOrderByQuestionOrderAsc(
                                    certification
                            )
                            .stream()
                            .filter(q ->
                                    q.getProblem()
                                            .getId()
                                            .equals(
                                                    problem.getId()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (problemQuestion != null
                    && !problemQuestion.getId()
                            .equals(existingQuestion.getId())) {

                throw new ConflictException(
                        "This problem is already added to this certification"
                );
            }
        }

        // ========================================================
        // DUPLICATE QUESTION ORDER
        // ========================================================

        if (questionRepository
                .existsByCertificationAndQuestionOrder(
                        certification,
                        request.getQuestionOrder()
                )) {

            CertificationQuestion orderQuestion =
                    questionRepository
                            .findByCertificationOrderByQuestionOrderAsc(
                                    certification
                            )
                            .stream()
                            .filter(q ->
                                    q.getQuestionOrder()
                                            .equals(
                                                    request.getQuestionOrder()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (orderQuestion != null
                    && !orderQuestion.getId()
                            .equals(existingQuestion.getId())) {

                throw new ConflictException(
                        "Question order "
                                + request.getQuestionOrder()
                                + " is already used"
                );
            }
        }

        // ========================================================
        // VALIDATE TOTAL WEIGHT
        // ========================================================

        validateTotalWeightForUpdate(
                certification,
                existingQuestion.getId(),
                request.getPercentageWeight()
        );

        // ========================================================
        // UPDATE QUESTION
        // ========================================================

        existingQuestion.setProblem(
                problem
        );

        existingQuestion.setQuestionOrder(
                request.getQuestionOrder()
        );

        existingQuestion.setPercentageWeight(
                request.getPercentageWeight()
        );

        // ========================================================
        // SAVE
        // ========================================================

        CertificationQuestion savedQuestion =
                questionRepository.save(
                        existingQuestion
                );

        return mapToResponse(
                savedQuestion
        );
    }

    // ============================================================
    // UPDATE CUSTOM CERTIFICATION PROBLEM
    // ============================================================

    public CertificationQuestionResponse updateCustomProblem(
            Long questionId,
            CustomProblemUpdateRequest request) {

        // ========================================================
        // FIND EXISTING QUESTION
        // ========================================================

        CertificationQuestion existingQuestion =
                questionRepository.findById(questionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Question not found"
                                )
                        );

        // ========================================================
        // VALIDATE REQUEST
        // ========================================================

        if (request == null) {

            throw new BadRequestException(
                    "Custom problem data is required"
            );
        }

        if (request.getProblem() == null) {

            throw new BadRequestException(
                    "Custom problem data is required"
            );
        }

        // ========================================================
        // GET EXISTING PROBLEM
        // ========================================================

        Problem existingProblem =
                existingQuestion.getProblem();

        if (existingProblem == null) {

            throw new ResourceNotFoundException(
                    "Problem not found for certification question"
            );
        }

        // ========================================================
        // ONLY CERTIFICATION-ONLY PROBLEMS
        // ========================================================

        if (!"CERTIFICATION_ONLY".equals(
                existingProblem.getSource())) {

            throw new BadRequestException(
                    "Only certification-only problems can be updated through this endpoint"
            );
        }

        // ========================================================
        // VALIDATE CUSTOM PROBLEM
        // ========================================================

        validateCustomProblem(
                request.getProblem()
        );

        // ========================================================
        // VALIDATE QUESTION ORDER
        // ========================================================

        if (request.getQuestionOrder() == null
                || request.getQuestionOrder() <= 0) {

            throw new ConflictException(
                    "Question order must be greater than zero"
            );
        }

        // ========================================================
        // VALIDATE PERCENTAGE WEIGHT
        // ========================================================

        if (request.getPercentageWeight() == null
                || request.getPercentageWeight() <= 0) {

            throw new BadRequestException(
                    "Percentage weight must be greater than zero"
            );
        }

        if (request.getPercentageWeight() > 100) {

            throw new BadRequestException(
                    "Percentage weight cannot be greater than 100"
            );
        }

        // ========================================================
        // GET CERTIFICATION
        // ========================================================

        Certification certification =
                existingQuestion.getCertification();

        // ========================================================
        // DUPLICATE QUESTION ORDER
        //
        // Ignore the current question itself.
        // ========================================================

        if (questionRepository
                .existsByCertificationAndQuestionOrder(
                        certification,
                        request.getQuestionOrder()
                )) {

            CertificationQuestion orderQuestion =
                    questionRepository
                            .findByCertificationOrderByQuestionOrderAsc(
                                    certification
                            )
                            .stream()
                            .filter(q ->
                                    q.getQuestionOrder()
                                            .equals(
                                                    request.getQuestionOrder()
                                            )
                            )
                            .findFirst()
                            .orElse(null);

            if (orderQuestion != null
                    && !orderQuestion.getId()
                            .equals(existingQuestion.getId())) {

                throw new ConflictException(
                        "Question order "
                                + request.getQuestionOrder()
                                + " is already used"
                );
            }
        }

        // ========================================================
        // VALIDATE TOTAL WEIGHT
        //
        // Existing question's old weight is excluded.
        // ========================================================

        validateTotalWeightForUpdate(
                certification,
                existingQuestion.getId(),
                request.getPercentageWeight()
        );

        // ========================================================
        // UPDATE EXISTING PROBLEM
        //
        // IMPORTANT:
        // We update the SAME Problem.
        // We do NOT create a new Problem.
        // ========================================================

        Problem updatedProblem =
                request.getProblem();

        existingProblem.setTitle(
                updatedProblem.getTitle().trim()
        );

        existingProblem.setDescription(
                updatedProblem.getDescription().trim()
        );

        existingProblem.setDifficulty(
                updatedProblem.getDifficulty()
        );

        existingProblem.setCategory(
                updatedProblem.getCategory().trim()
        );

        existingProblem.setInputFormat(
                updatedProblem.getInputFormat().trim()
        );

        existingProblem.setOutputFormat(
                updatedProblem.getOutputFormat().trim()
        );

        existingProblem.setConstraints(
                updatedProblem.getConstraints().trim()
        );

        // Always preserve certification-only source.
        existingProblem.setSource(
                "CERTIFICATION_ONLY"
        );

        // Keep custom problem active.
        existingProblem.setActive(true);

        // ========================================================
        // SAVE EXISTING PROBLEM
        // ========================================================

        problemRepository.save(
                existingProblem
        );

        // ========================================================
        // UPDATE CERTIFICATION QUESTION
        // ========================================================

        existingQuestion.setProblem(
                existingProblem
        );

        existingQuestion.setQuestionOrder(
                request.getQuestionOrder()
        );

        existingQuestion.setPercentageWeight(
                request.getPercentageWeight()
        );

        // ========================================================
        // SAVE QUESTION
        // ========================================================

        CertificationQuestion savedQuestion =
                questionRepository.save(
                        existingQuestion
                );

        // ========================================================
        // RETURN UPDATED QUESTION
        // ========================================================

        return mapToResponse(
                savedQuestion
        );
    }

    // ============================================================
    // DELETE QUESTION
    // ============================================================

    public void deleteQuestion(Long questionId) {

        CertificationQuestion question =
                questionRepository.findById(questionId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Question not found"
                                )
                        );

        /*
         * If this is a certification-only custom problem,
         * remove its test cases and problem as well.
         *
         * Normal CodeSprint problems are NEVER deleted here.
         */

        Problem problem =
                question.getProblem();

        questionRepository.delete(
                question
        );

        if (problem != null
                && "CERTIFICATION_ONLY".equals(
                        problem.getSource()
                )) {

            testCaseRepository.deleteAll(
                    testCaseRepository.findByProblemId(
                            problem.getId()
                    )
            );

            problemRepository.delete(
                    problem
            );
        }
    }

    // ============================================================
    // VALIDATE QUESTION LIMIT
    // ============================================================

    private void validateQuestionLimit(
            Certification certification) {

        long assignedQuestions =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                certification
                        )
                        .size();

        if (assignedQuestions
                >= certification.getTotalQuestions()) {

            throw new ConflictException(
                    "This certification already has "
                            + certification.getTotalQuestions()
                            + " questions"
            );
        }
    }

    // ============================================================
    // VALIDATE TOTAL WEIGHT FOR NEW QUESTION
    // ============================================================

    private void validateTotalWeightForNewQuestion(
            Certification certification,
            Double newWeight) {

        if (newWeight == null
                || newWeight <= 0) {

            throw new BadRequestException(
                    "Percentage weight must be greater than zero"
            );
        }

        if (newWeight > 100) {

            throw new BadRequestException(
                    "Percentage weight cannot be greater than 100"
            );
        }

        double currentTotal =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                certification
                        )
                        .stream()
                        .mapToDouble(q ->
                                q.getPercentageWeight() != null
                                        ? q.getPercentageWeight()
                                        : 0.0
                        )
                        .sum();

        double newTotal =
                currentTotal + newWeight;

        if (newTotal > 100) {

            throw new ConflictException(
                    "Total question weight cannot exceed 100%. "
                            + "Current total would be "
                            + newTotal
                            + "%"
            );
        }
    }

    // ============================================================
    // VALIDATE TOTAL WEIGHT FOR UPDATE
    // ============================================================

    private void validateTotalWeightForUpdate(
            Certification certification,
            Long currentQuestionId,
            Double newWeight) {

        if (newWeight == null
                || newWeight <= 0) {

            throw new BadRequestException(
                    "Percentage weight must be greater than zero"
            );
        }

        if (newWeight > 100) {

            throw new BadRequestException(
                    "Percentage weight cannot be greater than 100"
            );
        }

        double currentTotal =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                certification
                        )
                        .stream()
                        .filter(q ->
                                !q.getId()
                                        .equals(currentQuestionId)
                        )
                        .mapToDouble(q ->
                                q.getPercentageWeight() != null
                                        ? q.getPercentageWeight()
                                        : 0.0
                        )
                        .sum();

        double newTotal =
                currentTotal + newWeight;

        if (newTotal > 100) {

            throw new ConflictException(
                    "Total question weight cannot exceed 100%. "
                            + "Current total would be "
                            + newTotal
                            + "%"
            );
        }
    }

    // ============================================================
    // VALIDATE CUSTOM PROBLEM
    // ============================================================

    private void validateCustomProblem(
            Problem problem) {

        if (problem == null) {

            throw new BadRequestException(
                    "Custom problem data is required"
            );
        }

        if (isBlank(problem.getTitle())) {

            throw new BadRequestException(
                    "Problem title is required"
            );
        }

        if (isBlank(problem.getDescription())) {

            throw new BadRequestException(
                    "Problem description is required"
            );
        }

        if (isBlank(problem.getDifficulty())) {

            throw new BadRequestException(
                    "Problem difficulty is required"
            );
        }

        if (isBlank(problem.getCategory())) {

            throw new BadRequestException(
                    "Problem category is required"
            );
        }
    }

    // ============================================================
    // DUPLICATE PROBLEM VALIDATION
    // ============================================================

    private void validateDuplicateProblem(
            Certification certification,
            Problem problem) {

        if (questionRepository
                .existsByCertificationAndProblem(
                        certification,
                        problem
                )) {

            throw new ConflictException(
                    "This problem is already added to this certification"
            );
        }
    }

    // ============================================================
    // DUPLICATE QUESTION ORDER VALIDATION
    // ============================================================

    private void validateDuplicateQuestionOrder(
            Certification certification,
            Integer questionOrder) {

        if (questionRepository
                .existsByCertificationAndQuestionOrder(
                        certification,
                        questionOrder
                )) {

            throw new ConflictException(
                    "Question order "
                            + questionOrder
                            + " is already used"
            );
        }
    }

    // ============================================================
    // STRING VALIDATION
    // ============================================================

    private boolean isBlank(String value) {

        return value == null
                || value.trim().isEmpty();
    }

    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private CertificationQuestionResponse mapToResponse(
            CertificationQuestion question) {

        Problem problem =
                question.getProblem();

        return new CertificationQuestionResponse(
                question.getId(),
                question.getCertification().getId(),
                problem.getId(),
                problem.getTitle(),
                problem.getTitle(),
                problem.getDescription(),
                problem.getDifficulty(),
                problem.getCategory(),
                problem.getInputFormat(),
                problem.getOutputFormat(),
                problem.getConstraints(),
                question.getQuestionOrder(),
                question.getPercentageWeight(),
                problem.getSource()
        );
    }
}