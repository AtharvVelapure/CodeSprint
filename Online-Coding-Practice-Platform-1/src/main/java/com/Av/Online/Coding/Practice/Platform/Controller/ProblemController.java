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

import com.Av.Online.Coding.Practice.Platform.Service.ProblemService;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemDeleteResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;

@RestController
@RequestMapping("/api/problems")
public class ProblemController {

    private final ProblemService problemManagementService;


    public ProblemController(
            ProblemService problemManagementService) {

        this.problemManagementService =
                problemManagementService;
    }


    // ================================
    // GET ALL ACTIVE PROBLEMS
    // ================================

    @GetMapping
    public ResponseEntity<List<ProblemResponse>> getAllProblems() {

        return ResponseEntity.ok(
                problemManagementService.getAllProblems()
        );
    }


    // ================================
    // PROBLEMS BY CATEGORY
    // ================================

    @GetMapping("/category/{category}")
    public ResponseEntity<List<ProblemResponse>>
    getProblemsByCategory(
            @PathVariable String category) {

        return ResponseEntity.ok(
                problemManagementService
                        .getProblemsByCategory(category)
        );
    }


    // ================================
    // PROBLEMS BY DIFFICULTY
    // ================================

    @GetMapping("/difficulty/{difficulty}")
    public ResponseEntity<List<ProblemResponse>>
    getProblemsByDifficulty(
            @PathVariable String difficulty) {

        return ResponseEntity.ok(
                problemManagementService
                        .getProblemsByDifficulty(difficulty)
        );
    }


    // ================================
    // ADD PROBLEM
    // ================================

    @PostMapping
    public ResponseEntity<ProblemResponse> addProblem(
            @RequestBody Problem problem) {

        return ResponseEntity.ok(
                problemManagementService
                        .addProblem(problem)
        );
    }


    // ================================
    // DELETE PROBLEM
    // ================================

    @DeleteMapping("/{id}")
    public ResponseEntity<ProblemDeleteResponse> deleteProblem(
            @PathVariable Long id) {

    	ProblemDeleteResponse response =
        problemManagementService.deleteProblem(id);
    	
        return ResponseEntity.ok(response);
    }


    // ================================
    // DEACTIVATE PROBLEM
    // ================================

    @PutMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateProblem(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                problemManagementService
                        .deactivateProblem(id)
        );
    }


    // ================================
    // ACTIVATE PROBLEM
    // ================================

    @PutMapping("/{id}/activate")
    public ResponseEntity<String> activateProblem(
            @PathVariable Long id) {

        return ResponseEntity.ok(
                problemManagementService
                        .activateProblem(id)
        );
    }


    // ================================
    // UPDATE PROBLEM
    // ================================

    @PutMapping("/{id}")
    public ResponseEntity<ProblemResponse> updateProblem(
            @PathVariable Long id,
            @RequestBody Problem problem) {

        ProblemResponse response =
                problemManagementService
                        .updateProblem(id, problem);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }


    // ================================
    // ALL CATEGORIES
    // ================================

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getCategories() {

        return ResponseEntity.ok(
                problemManagementService.getCategories()
        );
    }


    // ================================
    // ALL DIFFICULTIES
    // ================================

    @GetMapping("/difficulties")
    public ResponseEntity<List<String>> getDifficulties() {

        return ResponseEntity.ok(
                problemManagementService.getDifficulties()
        );
    }


    // ================================
    // GET PROBLEM BY ID
    // ================================

    @GetMapping("/{id}")
    public ResponseEntity<?> getProblemById(
            @PathVariable Long id) {

        ProblemResponse response =
                problemManagementService
                        .getProblemById(id);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/admin/all")
    public ResponseEntity<List<ProblemResponse>> getAllProblemsForAdmin() {
        return ResponseEntity.ok(
                problemManagementService.getAllProblemsForAdmin()
        );
    }
}