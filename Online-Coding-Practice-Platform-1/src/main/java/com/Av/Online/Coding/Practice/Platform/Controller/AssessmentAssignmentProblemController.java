package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentAssignmentProblemService;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentAssignmentProblemResponse;

@RestController
@RequestMapping("/api/assessment-assignments")
public class AssessmentAssignmentProblemController {

    private final AssessmentAssignmentProblemService assessmentProblemService;

    public AssessmentAssignmentProblemController(
            AssessmentAssignmentProblemService assessmentProblemService) {

        this.assessmentProblemService =
                assessmentProblemService;
    }

    // =========================================================
    // ADD PROBLEM
    // =========================================================

    @PostMapping("/{assessmentId}/problems")
    public ResponseEntity<AssessmentAssignmentProblemResponse> addProblem(
            @PathVariable Long assessmentId,
            @RequestParam Long userId,
            @RequestParam Long problemId,
            @RequestParam Integer questionOrder,
            @RequestParam Double marks) {

        AssessmentAssignmentProblemResponse result =
                assessmentProblemService.addProblem(
                        userId,
                        assessmentId,
                        problemId,
                        questionOrder,
                        marks
                );

        return ResponseEntity.ok(result);
    }

    // =========================================================
    // GET ASSESSMENT PROBLEMS
    // =========================================================

    @GetMapping("/{assessmentId}/problems")
    public ResponseEntity<List<AssessmentAssignmentProblemResponse>>
            getAssessmentProblems(
                    @PathVariable Long assessmentId,
                    @RequestParam Long userId) {

        List<AssessmentAssignmentProblemResponse> problems =
                assessmentProblemService.getAssessmentProblems(
                        userId,
                        assessmentId
                );

        return ResponseEntity.ok(problems);
    }

    // =========================================================
    // UPDATE PROBLEM
    // =========================================================

    @PutMapping("/problems/{assessmentProblemId}")
    public ResponseEntity<AssessmentAssignmentProblemResponse> updateProblem(
            @PathVariable Long assessmentProblemId,
            @RequestParam Long userId,
            @RequestParam Integer questionOrder,
            @RequestParam Double marks) {

        AssessmentAssignmentProblemResponse result =
                assessmentProblemService.updateProblem(
                        userId,
                        assessmentProblemId,
                        questionOrder,
                        marks
                );

        return ResponseEntity.ok(result);
    }

    // =========================================================
    // REMOVE PROBLEM
    // =========================================================

    @DeleteMapping("/problems/{assessmentProblemId}")
    public ResponseEntity<String> removeProblem(
            @PathVariable Long assessmentProblemId,
            @RequestParam Long userId) {

        assessmentProblemService.removeProblem(
                userId,
                assessmentProblemId
        );

        return ResponseEntity.ok(
                "Problem removed from assessment successfully"
        );
    }
}