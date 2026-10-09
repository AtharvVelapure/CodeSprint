package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.TestCaseRepository;
import com.Av.Online.Coding.Practice.Platform.dto.TestCaseResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class TestCaseService {

    private final TestCaseRepository testCaseRepository;
    private final ProblemRepository problemRepository;

    public TestCaseService(
            TestCaseRepository testCaseRepository,
            ProblemRepository problemRepository) {

        this.testCaseRepository = testCaseRepository;
        this.problemRepository = problemRepository;
    }


    // ================================
    // GET TEST CASES BY PROBLEM
    // ================================

    public List<TestCaseResponse> getTestCasesByProblem(Long problemId) {

        return testCaseRepository
                .findByProblemId(problemId)
                .stream()
                .map(TestCaseResponse::new)
                .toList();
    }


    // ================================
    // ADD TEST CASE
    // ================================

    public TestCaseResponse addTestCase(
            Long problemId,
            TestCase testCase) {

        Problem problem = problemRepository
                .findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        testCase.setProblem(problem);

        TestCase savedTestCase =
                testCaseRepository.save(testCase);

        return new TestCaseResponse(savedTestCase);
    }


    // ================================
    // UPDATE TEST CASE
    // ================================

    public TestCaseResponse updateTestCase(
            Long id,
            TestCase updatedTestCase) {

        TestCase existingTestCase =
                testCaseRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Test case not found"));

        existingTestCase.setInput(
                updatedTestCase.getInput()
        );

        existingTestCase.setExpectedOutput(
                updatedTestCase.getExpectedOutput()
        );

        existingTestCase.setHidden(
                updatedTestCase.isHidden()
        );

        TestCase savedTestCase =
                testCaseRepository.save(existingTestCase);

        return new TestCaseResponse(savedTestCase);
    }


    // ================================
    // DELETE TEST CASE
    // ================================

    public String deleteTestCase(Long id) {

        if (!testCaseRepository.existsById(id)) {

            throw new ResourceNotFoundException("Test case not found");
        }

        testCaseRepository.deleteById(id);

        return "Test case deleted successfully";
    }
}