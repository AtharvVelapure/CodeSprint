package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.TestCaseRepository;
import com.Av.Online.Coding.Practice.Platform.Service.executor.CCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.CppCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.JavaCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.JavaScriptCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.PythonCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeRequest;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

@Service
public class SubmitCodeService {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;
    private final SubmissionRepository submissionRepository;

    private final JavaCodeExecutor javaCodeExecutor;
    private final CCodeExecutor cCodeExecutor;
    private final CppCodeExecutor cppCodeExecutor;
    private final PythonCodeExecutor pythonCodeExecutor;
    private final JavaScriptCodeExecutor javaScriptCodeExecutor;


    public SubmitCodeService(
            ProblemRepository problemRepository,
            TestCaseRepository testCaseRepository,
            SubmissionRepository submissionRepository,
            JavaCodeExecutor javaCodeExecutor,
            CCodeExecutor cCodeExecutor,
            CppCodeExecutor cppCodeExecutor,
            PythonCodeExecutor pythonCodeExecutor,
            JavaScriptCodeExecutor javaScriptCodeExecutor) {

        this.problemRepository = problemRepository;
        this.testCaseRepository = testCaseRepository;
        this.submissionRepository = submissionRepository;

        this.javaCodeExecutor = javaCodeExecutor;
        this.cCodeExecutor = cCodeExecutor;
        this.cppCodeExecutor = cppCodeExecutor;
        this.pythonCodeExecutor = pythonCodeExecutor;
        this.javaScriptCodeExecutor = javaScriptCodeExecutor;
    }


    // =========================================================
    // PRACTICE SUBMISSION
    // JUDGE + SAVE NORMAL SUBMISSION
    // =========================================================

    public RunCodeResponse submitCode(
            RunCodeRequest request) {

        RunCodeResponse response =
                judgeCode(request);

        /*
         * Do not save requests that failed before
         * actual judging could happen.
         */
        if (request == null
                || request.getUserId() == null
                || request.getProblemId() == null
                || request.getLanguage() == null
                || request.getLanguage().trim().isEmpty()
                || request.getCode() == null
                || request.getCode().trim().isEmpty()) {

            return response;
        }

        /*
         * If the problem does not exist, don't save.
         */
        if (!problemRepository.existsById(
                request.getProblemId())) {

            return response;
        }

        String submissionStatus;

        if (response.isSuccess()) {

            submissionStatus = "Accepted";

        } else {

            submissionStatus =
                    response.getStatus();

            if (submissionStatus == null
                    || submissionStatus
                            .trim()
                            .isEmpty()) {

                submissionStatus = "Failed";
            }
        }

        String language =
                request.getLanguage()
                        .trim()
                        .toLowerCase();

        Submission submission =
                new Submission();

        submission.setUserId(
                request.getUserId()
        );

        submission.setProblemId(
                request.getProblemId()
        );

        submission.setCode(
                request.getCode()
        );

        submission.setLanguage(
                language
        );

        submission.setStatus(
                submissionStatus
        );

        submission.setSubmittedAt(
                LocalDateTime.now()
        );

        /*
         * Normal practice submission.
         * contestId remains null.
         */
        submissionRepository.save(
                submission
        );

        return response;
    }


    // =========================================================
    // JUDGE CODE ONLY
    //
    // Used by contest system.
    // IMPORTANT:
    // This method DOES NOT save a Submission.
    // =========================================================

    public RunCodeResponse judgeCode(
            RunCodeRequest request) {

        // ========================================
        // VALIDATE REQUEST
        // ========================================

        if (request == null) {

            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Request body is required"
            );
        }


        // ========================================
        // VALIDATE USER ID
        // ========================================

        if (request.getUserId() == null) {

            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "User ID is required"
            );
        }


        // ========================================
        // VALIDATE PROBLEM ID
        // ========================================

        if (request.getProblemId() == null) {

            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Problem ID is required"
            );
        }


        // ========================================
        // FIND PROBLEM
        // ========================================

        Problem problem =
                problemRepository
                        .findById(
                                request.getProblemId()
                        )
                        .orElse(null);

        if (problem == null) {

            return new RunCodeResponse(
                    false,
                    "Problem Not Found",
                    null,
                    "Problem does not exist"
            );
        }


        // ========================================
        // VALIDATE LANGUAGE
        // ========================================

        if (request.getLanguage() == null
                || request.getLanguage()
                        .trim()
                        .isEmpty()) {

            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Programming language is required"
            );
        }


        // ========================================
        // VALIDATE CODE
        // ========================================

        if (request.getCode() == null
                || request.getCode()
                        .trim()
                        .isEmpty()) {

            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Code cannot be empty"
            );
        }


        // ========================================
        // GET TEST CASES
        // ========================================

        List<TestCase> testCases =
                testCaseRepository
                        .findByProblemId(
                                request.getProblemId()
                        );

        if (testCases.isEmpty()) {

            return new RunCodeResponse(
                    false,
                    "No Test Cases",
                    null,
                    "No test cases available for this problem"
            );
        }


        // ========================================
        // NORMALIZE LANGUAGE
        // ========================================

        String language =
                request.getLanguage()
                        .trim()
                        .toLowerCase();

        RunCodeResponse response;


        // ========================================
        // JAVA
        // ========================================

        if (language.equals("java")) {

            response =
                    javaCodeExecutor.execute(
                            request.getCode(),
                            testCases
                    );
        }


        // ========================================
        // C
        // ========================================

        else if (language.equals("c")) {

            response =
                    cCodeExecutor.execute(
                            request.getCode(),
                            testCases
                    );
        }


        // ========================================
        // C++
        // ========================================

        else if (language.equals("cpp")) {

            response =
                    cppCodeExecutor.execute(
                            request.getCode(),
                            testCases
                    );
        }


        // ========================================
        // PYTHON
        // ========================================

        else if (language.equals("python")) {

            response =
                    pythonCodeExecutor.execute(
                            request.getCode(),
                            testCases
                    );
        }


        // ========================================
        // JAVASCRIPT
        // ========================================

        else if (language.equals("javascript")) {

            response =
                    javaScriptCodeExecutor.execute(
                            request.getCode(),
                            testCases
                    );
        }


        // ========================================
        // UNSUPPORTED LANGUAGE
        // ========================================

        else {

            return new RunCodeResponse(
                    false,
                    "Unsupported Language",
                    null,
                    "This programming language is not supported yet"
            );
        }


        // ========================================
        // NORMALIZE RESPONSE
        // ========================================

        if (!response.isSuccess()) {

            return new RunCodeResponse(
                    false,
                    response.getStatus(),
                    null,
                    response.getError()
            );
        }


        return new RunCodeResponse(
                true,
                "Accepted",
                "All test cases passed",
                null
        );
    }
}