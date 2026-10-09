package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.TestCaseService;
import com.Av.Online.Coding.Practice.Platform.dto.TestCaseResponse;
import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

@RestController
@RequestMapping("/api/test-cases")
public class TestCaseController {

    private final TestCaseService testCaseService;

    public TestCaseController(
            TestCaseService testCaseService) {

        this.testCaseService = testCaseService;
    }


    // ================================
    // GET TEST CASES BY PROBLEM
    // ================================

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<TestCaseResponse>>
    getTestCasesByProblem(
            @PathVariable Long problemId) {

        return ResponseEntity.ok(
                testCaseService
                        .getTestCasesByProblem(problemId)
        );
    }


    // ================================
    // ADD TEST CASE
    // ================================

    @PostMapping("/problem/{problemId}")
    public ResponseEntity<TestCaseResponse>
    addTestCase(
            @PathVariable Long problemId,
            @RequestBody TestCase testCase) {

        TestCaseResponse response =
                testCaseService.addTestCase(
                        problemId,
                        testCase
                );

        return ResponseEntity.ok(response);
    }


    // ================================
    // UPDATE TEST CASE
    // ================================

    @PutMapping("/{id}")
    public ResponseEntity<TestCaseResponse>
    updateTestCase(
            @PathVariable Long id,
            @RequestBody TestCase testCase) {

        TestCaseResponse response =
                testCaseService.updateTestCase(
                        id,
                        testCase
                );

        return ResponseEntity.ok(response);
    }


    // ================================
    // DELETE TEST CASE
    // ================================

    @DeleteMapping("/{id}")
    public ResponseEntity<String>
    deleteTestCase(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                testCaseService
                        .deleteTestCase(id)
        );
    }
}