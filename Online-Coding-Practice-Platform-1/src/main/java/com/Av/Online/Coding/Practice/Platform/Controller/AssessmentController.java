package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentService;
import com.Av.Online.Coding.Practice.Platform.entity.Assessment;

@RestController
@RequestMapping("/api/assessments")
public class AssessmentController {

    private final AssessmentService assesmentService;

    public AssessmentController(AssessmentService assesmentService) {
        this.assesmentService = assesmentService;
    }

    // Create assessment
    @PostMapping
    public ResponseEntity<Assessment> createAssessment(
            @RequestBody Assessment assessment) {

        Assessment createdAssesment =
                assesmentService.createAssessment(assessment);

        return ResponseEntity.ok(createdAssesment);
    }

    // Get all assessments
    @GetMapping
    public ResponseEntity<List<Assessment>> getAllAssessments() {

        return ResponseEntity.ok(
                assesmentService.getAllAssessments()
        );
    }

    // Get assessment by ID
    @GetMapping("/{id}")
    public ResponseEntity<Assessment> getAssesmentById(
            @PathVariable Long id) {

        Assessment assessment =
                assesmentService.getAssessmentById(id);

        if (assessment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(assessment);
    }

    // Update assessment
    @PutMapping("/{id}")
    public ResponseEntity<Assessment> updateAssessment(
            @PathVariable Long id,
            @RequestBody Assessment assessment) {

        Assessment updatedAssessment =
                assesmentService.updateAssessment(id, assessment);

        if (updatedAssessment == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedAssessment);
    }

    // Delete assessment
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteAssesment(
            @PathVariable Long id) {

        boolean deleted =
                assesmentService.deleteAssessment(id);

        if (!deleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(
                "Assessment deleted successfully"
        );
    }
}
