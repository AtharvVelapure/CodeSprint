package com.Av.Online.Coding.Practice.Platform.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
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

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentAssignmentService;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;

@RestController
@RequestMapping("/api/assessment-assignments")
public class AssessmentAssignmentController {

    private final AssessmentAssignmentService assessmentService;

    public AssessmentAssignmentController(
            AssessmentAssignmentService assessmentService) {

        this.assessmentService = assessmentService;
    }

    @PostMapping
    public ResponseEntity<?> createAssessment(
            @RequestParam Long userId,
            @RequestParam String companyName,
            @RequestParam String companyEmail,
            @RequestParam String position,
            @RequestParam String startDateTime,
            @RequestParam Integer durationMinutes,
            @RequestParam(required = false) String instructions,
            @RequestParam(required = false, defaultValue = "false")
            Boolean cameraRequired,
            @RequestParam(required = false, defaultValue = "false")
            Boolean microphoneRequired,
            @RequestParam(required = false, defaultValue = "true")
            Boolean fullscreenRequired,
            @RequestParam(required = false, defaultValue = "3")
            Integer warningLimit) {

        LocalDateTime parsedStartDateTime =
                parseStartDateTime(startDateTime);

        AssessmentAssignment assessment =
                assessmentService.createAssessment(
                        userId,
                        companyName,
                        companyEmail,
                        position,
                        parsedStartDateTime,
                        durationMinutes,
                        instructions,
                        cameraRequired,
                        microphoneRequired,
                        fullscreenRequired,
                        warningLimit
                );

        return ResponseEntity.ok(assessment);
    }

    @GetMapping
    public ResponseEntity<?> getMyAssessments(
            @RequestParam Long userId) {

        List<AssessmentAssignment> assessments =
                assessmentService.getMyAssessments(userId);

        return ResponseEntity.ok(assessments);
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<?> getMyAssessment(
            @PathVariable Long assessmentId,
            @RequestParam Long userId) {

        AssessmentAssignment assessment =
                assessmentService.getMyAssessment(
                        userId,
                        assessmentId
                );

        return ResponseEntity.ok(assessment);
    }

    @PutMapping("/{assessmentId}")
    public ResponseEntity<?> updateAssessment(
            @PathVariable Long assessmentId,
            @RequestParam Long userId,
            @RequestParam String companyName,
            @RequestParam String companyEmail,
            @RequestParam String position,
            @RequestParam String startDateTime,
            @RequestParam Integer durationMinutes,
            @RequestParam(required = false) String instructions,
            @RequestParam(required = false, defaultValue = "false")
            Boolean cameraRequired,
            @RequestParam(required = false, defaultValue = "false")
            Boolean microphoneRequired,
            @RequestParam(required = false, defaultValue = "true")
            Boolean fullscreenRequired,
            @RequestParam(required = false, defaultValue = "3")
            Integer warningLimit) {

        LocalDateTime parsedStartDateTime =
                parseStartDateTime(startDateTime);

        AssessmentAssignment assessment =
                assessmentService.updateAssessment(
                        userId,
                        assessmentId,
                        companyName,
                        companyEmail,
                        position,
                        parsedStartDateTime,
                        durationMinutes,
                        instructions,
                        cameraRequired,
                        microphoneRequired,
                        fullscreenRequired,
                        warningLimit
                );

        return ResponseEntity.ok(assessment);
    }

    @DeleteMapping("/{assessmentId}")
    public ResponseEntity<?> deleteAssessment(
            @PathVariable Long assessmentId,
            @RequestParam Long userId) {

        assessmentService.deleteAssessment(
                userId,
                assessmentId
        );

        return ResponseEntity.ok(
                "Assessment deleted successfully"
        );
    }

    @PutMapping("/{assessmentId}/publish")
    public ResponseEntity<?> publishAssessment(
            @PathVariable Long assessmentId,
            @RequestParam Long userId) {

        return ResponseEntity.ok(
                assessmentService.publishAssessment(
                        userId,
                        assessmentId
                )
        );
    }

    private LocalDateTime parseStartDateTime(
            String startDateTime) {

        try {
            return LocalDateTime.parse(startDateTime);
        } catch (DateTimeParseException exception) {
            throw new BadRequestException(
                    "Invalid start date and time"
            );
        }
    }
}
