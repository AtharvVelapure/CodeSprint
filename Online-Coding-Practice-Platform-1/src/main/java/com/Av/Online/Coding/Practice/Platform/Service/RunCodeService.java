package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.TestCaseRepository;
import com.Av.Online.Coding.Practice.Platform.Service.executor.CCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.CppCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.JavaCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.JavaScriptCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.Service.executor.PythonCodeExecutor;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeRequest;
import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

@Service
public class RunCodeService {

    private final ProblemRepository problemRepository;
    private final TestCaseRepository testCaseRepository;

    private final JavaCodeExecutor javaCodeExecutor;
    private final CCodeExecutor cCodeExecutor;
    private final CppCodeExecutor cppCodeExecutor;
    private final PythonCodeExecutor pythonCodeExecutor;
    private final JavaScriptCodeExecutor javaScriptCodeExecutor;

    public RunCodeService(
            ProblemRepository problemRepository,
            TestCaseRepository testCaseRepository,
            JavaCodeExecutor javaCodeExecutor,
            CCodeExecutor cCodeExecutor,
            CppCodeExecutor cppCodeExecutor,
            PythonCodeExecutor pythonCodeExecutor,
            JavaScriptCodeExecutor javaScriptCodeExecutor) {

        this.problemRepository = problemRepository;
        this.testCaseRepository = testCaseRepository;
        this.javaCodeExecutor = javaCodeExecutor;
        this.cCodeExecutor = cCodeExecutor;
        this.cppCodeExecutor = cppCodeExecutor;
        this.pythonCodeExecutor = pythonCodeExecutor;
        this.javaScriptCodeExecutor = javaScriptCodeExecutor;
    }

    public RunCodeResponse runCode(RunCodeRequest request) {

        // Validate the request body.
        if (request == null) {
            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Request body is required"
            );
        }

        if (request.getProblemId() == null) {
            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Problem ID is required"
            );
        }

        Problem problem = problemRepository
                .findById(request.getProblemId())
                .orElse(null);

        if (problem == null) {
            return new RunCodeResponse(
                    false,
                    "Problem Not Found",
                    null,
                    "Problem does not exist"
            );
        }

        if (request.getLanguage() == null
                || request.getLanguage().trim().isEmpty()) {
            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Programming language is required"
            );
        }

        if (request.getCode() == null
                || request.getCode().trim().isEmpty()) {
            return new RunCodeResponse(
                    false,
                    "Invalid Request",
                    null,
                    "Code cannot be empty"
            );
        }

        // Run only visible test cases.
        List<TestCase> testCases =
                testCaseRepository.findByProblemIdAndHiddenFalse(
                        request.getProblemId()
                );

        if (testCases.isEmpty()) {
            return new RunCodeResponse(
                    false,
                    "No Test Cases",
                    null,
                    "No visible test cases available for this problem"
            );
        }

        String language = request.getLanguage()
                .trim()
                .toLowerCase();

        if (language.equals("java")) {
            return javaCodeExecutor.execute(
                    request.getCode(),
                    testCases
            );
        }

        if (language.equals("c")) {
            return cCodeExecutor.execute(
                    request.getCode(),
                    testCases
            );
        }

        if (language.equals("cpp")) {
            return cppCodeExecutor.execute(
                    request.getCode(),
                    testCases
            );
        }

        if (language.equals("python")) {
            return pythonCodeExecutor.execute(
                    request.getCode(),
                    testCases
            );
        }

        if (language.equals("javascript")) {
            return javaScriptCodeExecutor.execute(
                    request.getCode(),
                    testCases
            );
        }

        return new RunCodeResponse(
                false,
                "Unsupported Language",
                null,
                "This programming language is not supported yet"
        );
    }
}