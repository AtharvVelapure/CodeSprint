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

import com.Av.Online.Coding.Practice.Platform.Service.AdminCertificationQuestionService;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationQuestionRequest;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationQuestionResponse;
import com.Av.Online.Coding.Practice.Platform.dto.CustomProblemUpdateRequest;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;

@RestController
@RequestMapping("/api/admin/certifications")
public class AdminCertificationQuestionController {

    private final AdminCertificationQuestionService questionService;

    public AdminCertificationQuestionController(
            AdminCertificationQuestionService questionService) {

        this.questionService = questionService;
    }

    // ============================================================
    // ADD EXISTING PROBLEM
    // ============================================================

    @PostMapping("/{certificationId}/questions")
    public ResponseEntity<CertificationQuestionResponse> addQuestion(

            @PathVariable Long certificationId,

            @RequestBody CertificationQuestionRequest request) {

        return ResponseEntity.ok(
                questionService.addQuestion(
                        certificationId,
                        request
                )
        );
    }

    // ============================================================
    // ADD CUSTOM CERTIFICATION PROBLEM
    // ============================================================

    @PostMapping("/{certificationId}/custom-problems")
    public ResponseEntity<CertificationQuestionResponse> addCustomProblem(

            @PathVariable Long certificationId,

            @RequestBody CustomProblemRequest request) {

        return ResponseEntity.ok(
                questionService.addCustomProblem(
                        certificationId,
                        request.getProblem(),
                        request.getQuestionOrder(),
                        request.getPercentageWeight()
                )
        );
    }

    // ============================================================
    // GET ALL CODING QUESTIONS
    // ============================================================

    @GetMapping("/{certificationId}/questions")
    public ResponseEntity<List<CertificationQuestionResponse>> getQuestions(

            @PathVariable Long certificationId) {

        return ResponseEntity.ok(
                questionService.getQuestions(
                        certificationId
                )
        );
    }

    // ============================================================
    // GET CODING QUESTION BY ID
    // ============================================================

    @GetMapping("/questions/{questionId}")
    public ResponseEntity<CertificationQuestionResponse> getQuestion(

            @PathVariable Long questionId) {

        return ResponseEntity.ok(
                questionService.getQuestion(
                        questionId
                )
        );
    }

    // ============================================================
    // UPDATE CODING QUESTION
    //
    // Used for existing CodeSprint problems.
    // ============================================================

    @PutMapping("/questions/{questionId}")
    public ResponseEntity<CertificationQuestionResponse> updateQuestion(

            @PathVariable Long questionId,

            @RequestBody CertificationQuestionRequest request) {

        return ResponseEntity.ok(
                questionService.updateQuestion(
                        questionId,
                        request
                )
        );
    }

    // ============================================================
    // UPDATE CUSTOM CERTIFICATION PROBLEM
    //
    // Used only for CERTIFICATION_ONLY custom problems.
    // ============================================================

    @PutMapping("/questions/{questionId}/custom-problem")
    public ResponseEntity<CertificationQuestionResponse> updateCustomProblem(

            @PathVariable Long questionId,

            @RequestBody CustomProblemUpdateRequest request) {

        return ResponseEntity.ok(
                questionService.updateCustomProblem(
                        questionId,
                        request
                )
        );
    }

    // ============================================================
    // DELETE CODING QUESTION
    // ============================================================

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<String> deleteQuestion(

            @PathVariable Long questionId) {

        questionService.deleteQuestion(
                questionId
        );

        return ResponseEntity.ok(
                "Coding question removed from certification successfully"
        );
    }

    // ============================================================
    // CUSTOM PROBLEM REQUEST DTO
    // ============================================================

    public static class CustomProblemRequest {

        private Problem problem;

        private Integer questionOrder;

        private Double percentageWeight;

        public CustomProblemRequest() {
        }

        public Problem getProblem() {
            return problem;
        }

        public void setProblem(Problem problem) {
            this.problem = problem;
        }

        public Integer getQuestionOrder() {
            return questionOrder;
        }

        public void setQuestionOrder(
                Integer questionOrder) {

            this.questionOrder = questionOrder;
        }

        public Double getPercentageWeight() {
            return percentageWeight;
        }

        public void setPercentageWeight(
                Double percentageWeight) {

            this.percentageWeight = percentageWeight;
        }
    }
}