package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.CertificationAttemptRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationQuestionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificateRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.TestCaseRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.Service.executor.CodeExecutor;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationAttemptResponse;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationQuestionResponse;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationResponse;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationAttempt;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationQuestion;
import com.Av.Online.Coding.Practice.Platform.entity.Certificate;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;
import com.Av.Online.Coding.Practice.Platform.entity.User;

@Service
@Transactional
public class CertificationService {

    private final CertificationRepository certificationRepository;
    private final CertificationQuestionRepository questionRepository;
    private final CertificationAttemptRepository attemptRepository;
    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;
    private final TestCaseRepository testCaseRepository;
    private final List<CodeExecutor> codeExecutors;

    public CertificationService(
            CertificationRepository certificationRepository,
            CertificationQuestionRepository questionRepository,
            CertificationAttemptRepository attemptRepository,
            CertificateRepository certificateRepository,
            UserRepository userRepository,
            TestCaseRepository testCaseRepository,
            List<CodeExecutor> codeExecutors) {

        this.certificationRepository = certificationRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
        this.testCaseRepository = testCaseRepository;
        this.codeExecutors = codeExecutors;
    }

    // ============================================================
    // GET ACTIVE CERTIFICATIONS
    // ============================================================

    @Transactional(readOnly = true)
    public List<CertificationResponse> getActiveCertifications() {

        return certificationRepository
                .findByStatusOrderByTitleAsc("ACTIVE")
                .stream()
                .map(this::mapCertificationToResponse)
                .toList();
    }

    // ============================================================
    // GET CERTIFICATION
    // ============================================================

    @Transactional(readOnly = true)
    public CertificationResponse getCertification(
            Long certificationId) {

        Certification certification =
                certificationRepository.findById(certificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification not found"
                                )
                        );

        return mapCertificationToResponse(certification);
    }

    // ============================================================
    // GET CERTIFICATION QUESTIONS
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

        validateActiveCertification(certification);

        List<CertificationQuestion> questions =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                certification
                        );

        validateQuestionCount(
                certification,
                questions
        );

        return questions
                .stream()
                .map(this::mapQuestionToResponse)
                .toList();
    }

    // ============================================================
    // START CERTIFICATION
    // ============================================================

    public CertificationAttemptResponse startCertification(
            Long certificationId,
            Long userId) {

        Certification certification =
                certificationRepository.findById(certificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification not found"
                                )
                        );

        validateActiveCertification(certification);

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        // ========================================================
        // LOAD QUESTIONS
        // ========================================================

        List<CertificationQuestion> questions =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                certification
                        );

        validateQuestionCount(
                certification,
                questions
        );

        if (questions.isEmpty()) {

            throw new ConflictException(
                    "This certification has no coding questions"
            );
        }

        validatePercentageWeights(
                questions
        );

        // ========================================================
        // LOAD PREVIOUS ATTEMPTS
        // ========================================================

        List<CertificationAttempt> previousAttempts =
                attemptRepository
                        .findByUserAndCertificationOrderByStartedAtDesc(
                                user,
                                certification
                        );

        // ========================================================
        // CHECK EXISTING IN-PROGRESS ATTEMPT
        // ========================================================

        for (CertificationAttempt previousAttempt
                : previousAttempts) {

            if ("IN_PROGRESS".equalsIgnoreCase(
                    previousAttempt.getStatus())) {

                LocalDateTime expiresAt =
                        previousAttempt
                                .getStartedAt()
                                .plusMinutes(
                                        certification
                                                .getDurationMinutes()
                                );

                LocalDateTime now =
                        LocalDateTime.now();

                // Existing attempt is still valid
                if (!now.isAfter(expiresAt)) {

                    return mapAttemptToResponse(
                            previousAttempt
                    );
                }

                // Existing attempt expired
                previousAttempt.setSubmittedAt(
                        now
                );

                previousAttempt.setStatus(
                        "TIME_EXPIRED"
                );

                previousAttempt.setCorrectAnswers(
                        0
                );

                previousAttempt.setScore(
                        0
                );

                previousAttempt.setPercentage(
                        0.0
                );

                previousAttempt.setPassed(
                        false
                );

                attemptRepository.save(
                        previousAttempt
                );
            }
        }

        // ========================================================
        // REFRESH ATTEMPTS
        // ========================================================

        previousAttempts =
                attemptRepository
                        .findByUserAndCertificationOrderByStartedAtDesc(
                                user,
                                certification
                        );

        int attemptCount =
                previousAttempts.size();

        // ========================================================
        // RETAKE POLICY
        // ========================================================

        boolean allowRetake =
                Boolean.TRUE.equals(
                        certification.getAllowRetake()
                );

        int maxAttempts;

        if (!allowRetake) {

            maxAttempts = 1;

        } else {

            if (certification.getMaxAttempts() == null
                    || certification.getMaxAttempts() <= 1) {

                throw new ConflictException(
                        "Certification retake configuration is invalid"
                );
            }

            maxAttempts =
                    certification.getMaxAttempts();
        }

        // ========================================================
        // MAX ATTEMPTS
        // ========================================================

        if (attemptCount >= maxAttempts) {

            if (!allowRetake) {

                throw new ConflictException(
                        "You have already attempted this certification. "
                                + "Retake is not allowed."
                );

            } else {

                throw new ConflictException(
                        "Maximum attempts reached for this certification. "
                                + "Maximum allowed attempts: "
                                + maxAttempts
                );
            }
        }

        // ========================================================
        // CREATE ATTEMPT
        // ========================================================

        CertificationAttempt attempt =
                new CertificationAttempt();

        attempt.setCertification(
                certification
        );

        attempt.setUser(
                user
        );

        attempt.setStartedAt(
                LocalDateTime.now()
        );

        attempt.setSubmittedAt(
                null
        );

        attempt.setTotalQuestions(
                questions.size()
        );

        attempt.setCorrectAnswers(
                0
        );

        attempt.setScore(
                0
        );

        attempt.setPercentage(
                0.0
        );

        attempt.setPassed(
                false
        );

        attempt.setStatus(
                "IN_PROGRESS"
        );

        CertificationAttempt savedAttempt =
                attemptRepository.save(
                        attempt
                );

        return mapAttemptToResponse(
                savedAttempt
        );
    }

    // ============================================================
    // SUBMIT CERTIFICATION - DEFAULT JAVA
    // ============================================================

    public CertificationAttemptResponse submitCertification(
            Long attemptId,
            Map<Long, String> answers) {

        return submitCertification(
                attemptId,
                answers,
                "java"
        );
    }

    // ============================================================
    // SUBMIT CERTIFICATION WITH LANGUAGE
    // ============================================================

    /*
     * IMPORTANT:
     *
     * ConflictException must NOT roll back this transaction.
     *
     * When the certification timer has expired, we first save the
     * attempt as TIME_EXPIRED and then return a 409 Conflict.
     *
     * Without noRollbackFor, throwing ConflictException could undo
     * the TIME_EXPIRED database update.
     */
    @Transactional(noRollbackFor = ConflictException.class)
    public CertificationAttemptResponse submitCertification(
            Long attemptId,
            Map<Long, String> answers,
            String language) {

        CertificationAttempt attempt =
                attemptRepository.findById(attemptId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification attempt not found"
                                )
                        );

        // ========================================================
        // ALREADY SUBMITTED
        // ========================================================

        if (!"IN_PROGRESS".equalsIgnoreCase(
                attempt.getStatus())) {

            throw new ConflictException(
                    "This certification attempt has already been submitted"
            );
        }

        Certification certification =
                attempt.getCertification();

        validateActiveCertification(
                certification
        );

        LocalDateTime now =
                LocalDateTime.now();

        // ========================================================
        // CHECK TIME
        // ========================================================

        LocalDateTime expiresAt =
                attempt
                        .getStartedAt()
                        .plusMinutes(
                                certification
                                        .getDurationMinutes()
                        );

        if (now.isAfter(expiresAt)) {

            attempt.setSubmittedAt(
                    now
            );

            attempt.setStatus(
                    "TIME_EXPIRED"
            );

            attempt.setCorrectAnswers(
                    0
            );

            attempt.setScore(
                    0
            );

            attempt.setPercentage(
                    0.0
            );

            attempt.setPassed(
                    false
            );

            /*
             * Save the expired state.
             *
             * noRollbackFor above ensures this update remains
             * committed even though ConflictException is thrown.
             */
            attemptRepository.save(
                    attempt
            );

            throw new ConflictException(
                    "Certification time has expired"
            );
        }

        // ========================================================
        // LOAD QUESTIONS
        // ========================================================

        List<CertificationQuestion> questions =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                certification
                        );

        validateQuestionCount(
                certification,
                questions
        );

        validatePercentageWeights(
                questions
        );

        if (questions.isEmpty()) {

            throw new ConflictException(
                    "This certification has no coding questions"
            );
        }

        if (answers == null) {
            answers = Map.of();
        }

        // ========================================================
        // VALIDATE QUESTION IDS
        // ========================================================

        for (Long submittedQuestionId
                : answers.keySet()) {

            if (submittedQuestionId == null) {

                throw new BadRequestException(
                        "Question ID cannot be null"
                );
            }

            boolean belongsToCertification =
                    questions
                            .stream()
                            .anyMatch(question ->
                                    question
                                            .getId()
                                            .equals(
                                                    submittedQuestionId
                                            )
                            );

            if (!belongsToCertification) {

                throw new BadRequestException(
                        "Invalid certification question: "
                                + submittedQuestionId
                );
            }
        }

        // ========================================================
        // FIND EXECUTOR
        // ========================================================

        CodeExecutor executor =
                findExecutor(
                        language
                );

        // ========================================================
        // EXECUTE QUESTIONS
        // ========================================================

        double percentage =
                0.0;

        int solvedQuestions =
                0;

        for (CertificationQuestion question
                : questions) {

            String code =
                    answers.get(
                            question.getId()
                    );

            // No code submitted
            if (code == null
                    || code.trim().isEmpty()) {

                continue;
            }

            Problem problem =
                    question.getProblem();

            if (problem == null) {

                throw new ConflictException(
                        "Problem is missing for certification question "
                                + question.getId()
                );
            }

            // ====================================================
            // LOAD TEST CASES
            // ====================================================

            List<TestCase> testCases =
                    testCaseRepository
                            .findByProblemId(
                                    problem.getId()
                            );

            if (testCases == null
                    || testCases.isEmpty()) {

                throw new ConflictException(
                        "No test cases found for problem: "
                                + problem.getTitle()
                );
            }

            // ====================================================
            // EXECUTE CODE
            // ====================================================

            RunCodeResponse executionResult =
                    executor.execute(
                            code,
                            testCases
                    );

            boolean accepted =
                    executionResult != null
                            && executionResult.isSuccess()
                            && executionResult.getStatus() != null
                            && "Accepted".equalsIgnoreCase(
                                    executionResult
                                            .getStatus()
                                            .trim()
                            );

            if (accepted) {

                percentage +=
                        question.getPercentageWeight();

                solvedQuestions++;
            }
        }

        // ========================================================
        // ROUND PERCENTAGE
        // ========================================================

        percentage =
                Math.round(
                        percentage * 100.0
                ) / 100.0;

        if (percentage > 100.0) {
            percentage = 100.0;
        }

        // ========================================================
        // PASS / FAIL
        // ========================================================

        boolean passed =
                percentage >=
                        certification
                                .getPassingPercentage();

        // ========================================================
        // UPDATE ATTEMPT
        // ========================================================

        attempt.setSubmittedAt(
                now
        );

        attempt.setTotalQuestions(
                questions.size()
        );

        attempt.setCorrectAnswers(
                solvedQuestions
        );

        attempt.setScore(
                (int) Math.round(
                        percentage
                )
        );

        attempt.setPercentage(
                percentage
        );

        attempt.setPassed(
                passed
        );

        attempt.setStatus(
                "COMPLETED"
        );

        CertificationAttempt savedAttempt =
                attemptRepository.save(
                        attempt
                );

        // ========================================================
        // GENERATE CERTIFICATE
        // ========================================================

        if (passed) {

            generateCertificate(
                    savedAttempt
            );
        }

        return mapAttemptToResponse(
                savedAttempt
        );
    }

    // ============================================================
    // GET ATTEMPT
    // ============================================================

    @Transactional(readOnly = true)
    public CertificationAttemptResponse getAttempt(
            Long attemptId) {

        CertificationAttempt attempt =
                attemptRepository.findById(attemptId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certification attempt not found"
                                )
                        );

        return mapAttemptToResponse(
                attempt
        );
    }

    // ============================================================
    // GET USER ATTEMPTS
    // ============================================================

    @Transactional(readOnly = true)
    public List<CertificationAttemptResponse> getUserAttempts(
            Long userId) {

        User user =
                userRepository.findById(userId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "User not found"
                                )
                        );

        return attemptRepository
                .findByUserOrderByStartedAtDesc(
                        user
                )
                .stream()
                .map(this::mapAttemptToResponse)
                .toList();
    }

    // ============================================================
    // GENERATE CERTIFICATE
    // ============================================================

    private Certificate generateCertificate(
            CertificationAttempt attempt) {

        /*
         * One certificate per user + certification.
         *
         * Retaking a certification after passing must not
         * generate duplicate certificates.
         */
        Certificate existingCertificate =
                certificateRepository
                        .findByUserAndCertification(
                                attempt.getUser(),
                                attempt.getCertification()
                        )
                        .orElse(null);

        if (existingCertificate != null) {
            return existingCertificate;
        }

        Certificate certificate =
                new Certificate();

        certificate.setUser(
                attempt.getUser()
        );

        certificate.setCertification(
                attempt.getCertification()
        );

        /*
         * This is the attempt on which the user first
         * earned the certification.
         */
        certificate.setAttempt(
                attempt
        );

        certificate.setCertificateNumber(
                generateCertificateNumber()
        );

        certificate.setCertificateType(
                "CERTIFICATION"
        );

        certificate.setScore(
                (int) Math.round(
                        attempt.getPercentage()
                )
        );

        certificate.setPercentage(
                attempt.getPercentage()
        );

        certificate.setIssuedAt(
                LocalDateTime.now()
        );

        certificate.setVerified(
                true
        );

        return certificateRepository.save(
                certificate
        );
    }

    // ============================================================
    // CERTIFICATE NUMBER
    // ============================================================

    private String generateCertificateNumber() {

        String certificateNumber;

        do {

            certificateNumber =
                    "CERT-CS-"
                            + UUID
                                    .randomUUID()
                                    .toString()
                                    .substring(
                                            0,
                                            8
                                    )
                                    .toUpperCase();

        } while (
                certificateRepository
                        .existsByCertificateNumber(
                                certificateNumber
                        )
        );

        return certificateNumber;
    }

    // ============================================================
    // FIND EXECUTOR
    // ============================================================

    private CodeExecutor findExecutor(
            String language) {

        if (language == null
                || language.trim().isEmpty()) {

            throw new BadRequestException(
                    "Programming language is required"
            );
        }

        String normalizedLanguage =
                language
                        .trim()
                        .toLowerCase();

        for (CodeExecutor executor
                : codeExecutors) {

            String executorName =
                    executor
                            .getClass()
                            .getSimpleName()
                            .toLowerCase();

            if (matchesLanguage(
                    executorName,
                    normalizedLanguage)) {

                return executor;
            }
        }

        throw new BadRequestException(
                "Unsupported programming language: "
                        + language
        );
    }

    // ============================================================
    // LANGUAGE MATCHING
    // ============================================================

    private boolean matchesLanguage(
            String executorName,
            String language) {

        switch (language) {

            case "java":
                return executorName.contains("java")
                        && !executorName.contains(
                                "javascript"
                        );

            case "python":
            case "python3":
                return executorName.contains(
                        "python"
                );

            case "cpp":
            case "c++":
                return executorName.contains(
                        "cpp"
                );

            case "c":
                return executorName.equals(
                        "ccodeexecutor"
                );

            case "javascript":
            case "js":
            case "node":
            case "nodejs":
                return executorName.contains(
                        "javascript"
                );

            default:
                return false;
        }
    }

    // ============================================================
    // VALIDATE ACTIVE CERTIFICATION
    // ============================================================

    private void validateActiveCertification(
            Certification certification) {

        if (certification == null) {

            throw new ConflictException(
                    "Certification is missing"
            );
        }

        if (!"ACTIVE".equalsIgnoreCase(
                certification.getStatus())) {

            throw new ConflictException(
                    "Certification is not active"
            );
        }
    }

    // ============================================================
    // VALIDATE QUESTION COUNT
    // ============================================================

    private void validateQuestionCount(
            Certification certification,
            List<CertificationQuestion> questions) {

        if (certification.getTotalQuestions() == null) {
            return;
        }

        if (!certification
                .getTotalQuestions()
                .equals(
                        questions.size()
                )) {

            throw new ConflictException(
                    "Certification question count mismatch. "
                            + "Expected "
                            + certification.getTotalQuestions()
                            + " questions but found "
                            + questions.size()
            );
        }
    }

    // ============================================================
    // VALIDATE PERCENTAGE WEIGHTS
    // ============================================================

    private void validatePercentageWeights(
            List<CertificationQuestion> questions) {

        double totalWeight =
                0.0;

        for (CertificationQuestion question
                : questions) {

            if (question.getPercentageWeight() == null
                    || question.getPercentageWeight() <= 0
                    || question.getPercentageWeight() > 100) {

                throw new ConflictException(
                        "Invalid percentage weight for question "
                                + question.getId()
                );
            }

            totalWeight +=
                    question.getPercentageWeight();
        }

        totalWeight =
                Math.round(
                        totalWeight * 100.0
                ) / 100.0;

        if (Math.abs(
                totalWeight - 100.0
        ) > 0.01) {

            throw new ConflictException(
                    "Certification question weights must total 100%. "
                            + "Current total: "
                            + totalWeight
                            + "%"
            );
        }
    }

    // ============================================================
    // MAP CERTIFICATION
    // ============================================================

    private CertificationResponse mapCertificationToResponse(
            Certification certification) {

        return new CertificationResponse(

                certification.getId(),

                certification.getTitle(),

                certification.getDescription(),

                certification.getCategory(),

                certification.getDifficulty(),

                certification.getDurationMinutes(),

                certification.getTotalQuestions(),

                certification.getPassingPercentage(),

                certification.getStatus(),

                certification.getAllowRetake(),

                certification.getMaxAttempts()
        );
    }

    // ============================================================
    // MAP QUESTION
    // ============================================================

    private CertificationQuestionResponse mapQuestionToResponse(
            CertificationQuestion question) {

        Problem problem =
                question.getProblem();

        if (problem == null) {

            throw new ConflictException(
                    "Problem is missing for certification question "
                            + question.getId()
            );
        }

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

    // ============================================================
    // MAP ATTEMPT
    // ============================================================

    private CertificationAttemptResponse mapAttemptToResponse(
            CertificationAttempt attempt) {

        Certificate certificate =
                certificateRepository
                        .findByAttempt(
                                attempt
                        )
                        .orElse(null);

        String submittedAt =
                attempt.getSubmittedAt() == null
                        ? null
                        : attempt
                                .getSubmittedAt()
                                .toString();

        return new CertificationAttemptResponse(

                attempt.getId(),

                attempt.getCertification().getId(),

                attempt.getCertification().getTitle(),

                attempt.getUser().getId(),

                attempt.getUser().getName(),

                attempt.getTotalQuestions(),

                attempt.getCorrectAnswers(),

                attempt.getScore(),

                attempt.getPercentage(),

                attempt.getPassed(),

                attempt.getStatus(),

                attempt.getStartedAt().toString(),

                submittedAt,

                certificate == null
                        ? null
                        : certificate.getId(),

                certificate == null
                        ? null
                        : certificate.getCertificateNumber()
        );
    }
}