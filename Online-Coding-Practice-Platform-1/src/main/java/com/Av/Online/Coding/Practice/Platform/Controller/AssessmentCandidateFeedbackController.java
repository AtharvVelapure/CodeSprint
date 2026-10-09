package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.AssessmentCandidateFeedbackService;

import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateFeedbackRequest;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCandidateFeedbackResponse;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentCreatorFeedbackResponse;

@RestController
@RequestMapping("/api/assessment-candidates")
public class AssessmentCandidateFeedbackController {

    private final AssessmentCandidateFeedbackService feedbackService;

    public AssessmentCandidateFeedbackController(
            AssessmentCandidateFeedbackService feedbackService) {

        this.feedbackService =
                feedbackService;
    }


    // =========================================================
    // SUBMIT CANDIDATE FEEDBACK
    // =========================================================

    @PostMapping("/{invitationToken}/feedback")
    public ResponseEntity<AssessmentCandidateFeedbackResponse>
            submitFeedback(

                    @PathVariable String invitationToken,

                    @RequestBody
                    AssessmentCandidateFeedbackRequest request) {

        AssessmentCandidateFeedbackResponse response =
                feedbackService.submitFeedback(
                        invitationToken,
                        request
                );

        return ResponseEntity.ok(response);
    }


    // =========================================================
    // GET FEEDBACK FOR ASSESSMENT CREATOR
    // =========================================================

    @GetMapping("/assessment/{assessmentId}/feedback")
    public ResponseEntity<List<AssessmentCreatorFeedbackResponse>>
            getAssessmentFeedback(

                    @PathVariable Long assessmentId,

                    @RequestParam Long userId) {

        List<AssessmentCreatorFeedbackResponse> response =
                feedbackService.getAssessmentFeedback(
                        userId,
                        assessmentId
                );

        return ResponseEntity.ok(response);
    }
}