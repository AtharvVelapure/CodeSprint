package com.Av.Online.Coding.Practice.Platform.dto;

public class AssessmentAssignmentProblemResponse {

    private Long id;
    private Integer questionOrder;
    private Double marks;
    private ProblemSummary problem;

    public AssessmentAssignmentProblemResponse() {
    }

    public AssessmentAssignmentProblemResponse(
            Long id,
            Integer questionOrder,
            Double marks,
            ProblemSummary problem) {

        this.id = id;
        this.questionOrder = questionOrder;
        this.marks = marks;
        this.problem = problem;
    }

    public Long getId() {
        return id;
    }

    public Integer getQuestionOrder() {
        return questionOrder;
    }

    public Double getMarks() {
        return marks;
    }

    public ProblemSummary getProblem() {
        return problem;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setQuestionOrder(Integer questionOrder) {
        this.questionOrder = questionOrder;
    }

    public void setMarks(Double marks) {
        this.marks = marks;
    }

    public void setProblem(ProblemSummary problem) {
        this.problem = problem;
    }

    public static class ProblemSummary {

        private Long id;
        private String title;
        private String category;
        private String difficulty;

        public ProblemSummary() {
        }

        public ProblemSummary(
                Long id,
                String title,
                String category,
                String difficulty) {

            this.id = id;
            this.title = title;
            this.category = category;
            this.difficulty = difficulty;
        }

        public Long getId() {
            return id;
        }

        public String getTitle() {
            return title;
        }

        public String getCategory() {
            return category;
        }

        public String getDifficulty() {
            return difficulty;
        }

        public void setId(Long id) {
            this.id = id;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public void setCategory(String category) {
            this.category = category;
        }

        public void setDifficulty(String difficulty) {
            this.difficulty = difficulty;
        }
    }
}