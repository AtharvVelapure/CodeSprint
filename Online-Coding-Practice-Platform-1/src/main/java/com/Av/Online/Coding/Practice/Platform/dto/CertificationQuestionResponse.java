package com.Av.Online.Coding.Practice.Platform.dto;

public class CertificationQuestionResponse {

    private Long id;

    private Long certificationId;

    private Long problemId;

    private String problemTitle;

    private String question;

    private String description;

    private String difficulty;

    private String category;

    private String inputFormat;

    private String outputFormat;

    private String constraints;

    private Integer questionOrder;

    private Double percentageWeight;

    /*
     * NORMAL
     * CERTIFICATION_ONLY
     */
    private String source;


    // =========================
    // DEFAULT CONSTRUCTOR
    // =========================

    public CertificationQuestionResponse() {

    }


    // =========================
    // FULL CONSTRUCTOR
    // =========================

    public CertificationQuestionResponse(

            Long id,

            Long certificationId,

            Long problemId,

            String problemTitle,

            String question,

            String description,

            String difficulty,

            String category,

            String inputFormat,

            String outputFormat,

            String constraints,

            Integer questionOrder,

            Double percentageWeight,

            String source) {

        this.id = id;

        this.certificationId = certificationId;

        this.problemId = problemId;

        this.problemTitle = problemTitle;

        this.question = question;

        this.description = description;

        this.difficulty = difficulty;

        this.category = category;

        this.inputFormat = inputFormat;

        this.outputFormat = outputFormat;

        this.constraints = constraints;

        this.questionOrder = questionOrder;

        this.percentageWeight = percentageWeight;

        this.source = source;

    }


    // =========================
    // GETTERS AND SETTERS
    // =========================

    public Long getId() {

        return id;

    }

    public void setId(Long id) {

        this.id = id;

    }


    public Long getCertificationId() {

        return certificationId;

    }

    public void setCertificationId(Long certificationId) {

        this.certificationId = certificationId;

    }


    public Long getProblemId() {

        return problemId;

    }

    public void setProblemId(Long problemId) {

        this.problemId = problemId;

    }


    public String getProblemTitle() {

        return problemTitle;

    }

    public void setProblemTitle(String problemTitle) {

        this.problemTitle = problemTitle;

    }


    public String getQuestion() {

        return question;

    }

    public void setQuestion(String question) {

        this.question = question;

    }


    public String getDescription() {

        return description;

    }

    public void setDescription(String description) {

        this.description = description;

    }


    public String getDifficulty() {

        return difficulty;

    }

    public void setDifficulty(String difficulty) {

        this.difficulty = difficulty;

    }


    public String getCategory() {

        return category;

    }

    public void setCategory(String category) {

        this.category = category;

    }


    public String getInputFormat() {

        return inputFormat;

    }

    public void setInputFormat(String inputFormat) {

        this.inputFormat = inputFormat;

    }


    public String getOutputFormat() {

        return outputFormat;

    }

    public void setOutputFormat(String outputFormat) {

        this.outputFormat = outputFormat;

    }


    public String getConstraints() {

        return constraints;

    }

    public void setConstraints(String constraints) {

        this.constraints = constraints;

    }


    public Integer getQuestionOrder() {

        return questionOrder;

    }

    public void setQuestionOrder(Integer questionOrder) {

        this.questionOrder = questionOrder;

    }


    public Double getPercentageWeight() {

        return percentageWeight;

    }

    public void setPercentageWeight(Double percentageWeight) {

        this.percentageWeight = percentageWeight;

    }


    public String getSource() {

        return source;

    }

    public void setSource(String source) {

        this.source = source;

    }

}