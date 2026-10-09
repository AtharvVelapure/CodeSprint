package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AIChatResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class CodeSpiritAIService {

    private final WebClient webClient;
    private final JsonMapper jsonMapper;
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model}")
    private String groqModel;

    public CodeSpiritAIService(
            WebClient.Builder webClientBuilder,
            JsonMapper jsonMapper,
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository) {

        this.webClient = webClientBuilder.build();
        this.jsonMapper = jsonMapper;
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
    }

    public AIChatResponse chat(String userMessage, Long userId) {

        try {

            String normalizedMessage =
                    userMessage.toLowerCase().trim();

            /*
             * =====================================================
             * DETERMINE WHAT USER IS ASKING
             * =====================================================
             */

            boolean asksForRecentSubmissions =
                    normalizedMessage.contains("recent submission")
                    || normalizedMessage.contains("recent submissions")
                    || normalizedMessage.contains("last submission")
                    || normalizedMessage.contains("last submissions")
                    || normalizedMessage.contains("latest submission")
                    || normalizedMessage.contains("latest submissions")
                    || normalizedMessage.contains("my submissions")
                    || normalizedMessage.contains("show my submissions");

            boolean asksForSolvedCount =
                    normalizedMessage.contains("how many problems")
                    || normalizedMessage.contains("how many problem")
                    || normalizedMessage.contains("problems solved")
                    || normalizedMessage.contains("problem solved")
                    || normalizedMessage.contains("solved count")
                    || normalizedMessage.contains("how many did i solve")
                    || normalizedMessage.contains("how many have i solved");

            boolean asksForStats =
                    normalizedMessage.contains("my stats")
                    || normalizedMessage.contains("my statistics")
                    || normalizedMessage.contains("coding stats")
                    || normalizedMessage.contains("coding statistics")
                    || normalizedMessage.contains("my progress")
                    || normalizedMessage.contains("my performance");

            /*
             * =====================================================
             * DATABASE CONTEXT
             * =====================================================
             */

            String databaseContext = "";

            /*
             * =====================================================
             * RECENT SUBMISSIONS
             * =====================================================
             */

            if (userId != null && asksForRecentSubmissions) {

                List<Submission> recentSubmissions =
                        submissionRepository
                                .findTop5ByUserIdOrderBySubmittedAtDesc(userId);

                StringBuilder builder =
                        new StringBuilder();

                builder.append("""
                        RECENT SUBMISSIONS
                        
                        The following information comes directly
                        from the CodeSprint database.
                        
                        """);

                if (recentSubmissions.isEmpty()) {

                    builder.append(
                            "The user has no submissions yet.\n"
                    );

                } else {

                    DateTimeFormatter formatter =
                            DateTimeFormatter.ofPattern(
                                    "dd MMM yyyy, hh:mm a"
                            );

                    for (int i = 0;
                         i < recentSubmissions.size();
                         i++) {

                        Submission submission =
                                recentSubmissions.get(i);

                        String problemTitle =
                                "Unknown Problem";

                        Problem problem =
                                problemRepository
                                        .findById(
                                                submission.getProblemId()
                                        )
                                        .orElse(null);

                        if (problem != null) {
                            problemTitle =
                                    problem.getTitle();
                        }

                        builder.append(i + 1)
                                .append(". Problem: ")
                                .append(problemTitle)
                                .append(", Language: ")
                                .append(submission.getLanguage())
                                .append(", Status: ")
                                .append(submission.getStatus())
                                .append(", Submitted: ");

                        if (submission.getSubmittedAt() != null) {

                            builder.append(
                                    submission
                                            .getSubmittedAt()
                                            .format(formatter)
                            );

                        } else {

                            builder.append("Unknown");

                        }

                        builder.append("\n");
                    }
                }

                databaseContext =
                        builder.toString();
            }

            /*
             * =====================================================
             * SOLVED COUNT
             * =====================================================
             */

            else if (userId != null && asksForSolvedCount) {

                long totalSolved =
                        submissionRepository
                                .countSolvedProblemsByUserId(userId);

                databaseContext = """
                        SOLVED PROBLEMS

                        Total solved problems: %d

                        This value comes directly from the
                        CodeSprint database.

                        Do not change, estimate, or invent
                        this number.
                        """.formatted(totalSolved);
            }

            /*
             * =====================================================
             * USER STATISTICS
             * =====================================================
             */

            else if (userId != null && asksForStats) {

                long totalSolved =
                        submissionRepository
                                .countSolvedProblemsByUserId(userId);

                long totalAttempted =
                        submissionRepository
                                .countAttemptedProblemsByUserId(userId);

                long totalSubmissions =
                        submissionRepository
                                .countByUserId(userId);

                long acceptedSubmissions =
                        submissionRepository
                                .countAcceptedSubmissionsByUserId(userId);

                double acceptanceRate =
                        totalSubmissions > 0
                                ? ((double) acceptedSubmissions
                                   / totalSubmissions) * 100.0
                                : 0.0;

                long easySolved =
                        countSolvedByDifficulty(userId, "Easy");

                long mediumSolved =
                        countSolvedByDifficulty(userId, "Medium");

                long hardSolved =
                        countSolvedByDifficulty(userId, "Hard");

                databaseContext = """
                        USER CODING STATISTICS

                        Total solved problems: %d
                        Total attempted problems: %d
                        Total submissions: %d
                        Acceptance rate: %.2f%%

                        Easy solved: %d
                        Medium solved: %d
                        Hard solved: %d

                        All of these values come directly
                        from the CodeSprint database.

                        Do not change, estimate, or invent
                        these numbers.
                        """.formatted(
                                totalSolved,
                                totalAttempted,
                                totalSubmissions,
                                acceptanceRate,
                                easySolved,
                                mediumSolved,
                                hardSolved
                        );
            }

            /*
             * =====================================================
             * USER NOT LOGGED IN
             * =====================================================
             */

            if (userId == null &&
                    (asksForRecentSubmissions
                    || asksForSolvedCount
                    || asksForStats)) {

                databaseContext = """
                        USER DATA

                        The user ID was not provided.

                        Therefore, user-specific CodeSprint
                        statistics and submissions are not available.

                        Do not invent any user statistics.
                        """;
            }

            /*
             * =====================================================
             * SYSTEM PROMPT
             * =====================================================
             */

            String systemPrompt = """
                    You are CodeSpirit AI, the official AI
                    assistant of the CodeSprint coding platform.

                    Your job is to help users with programming
                    questions and provide information about their
                    CodeSprint activity when database information
                    is provided.

                    USER DATA RULES:

                    - Never invent user statistics.
                    - Never modify database values.
                    - Use database values exactly as provided.
                    - Do not assume missing information.
                    - Do not claim access to information that
                      was not provided.
                    - Keep answers simple and concise.
                    - For general programming questions, answer
                      normally without mentioning the database.

                    RECENT SUBMISSIONS RULE:

                    When recent submissions are provided, show only:
                    - Problem name
                    - Language
                    - Submission status
                    - Submission date/time

                    Do not add difficulty, category, code,
                    problem description, or other information.

                    SOLVED COUNT RULE:

                    When the user asks how many problems they
                    solved, answer using the exact solved count
                    provided by the database.

                    STATS RULE:

                    When user statistics are provided, explain:
                    - Total solved problems
                    - Total attempted problems
                    - Total submissions
                    - Acceptance rate
                    - Easy solved
                    - Medium solved
                    - Hard solved

                    Do not invent coding streak information because
                    coding streak is not currently provided.

                    DATABASE CONTEXT:

                    """
                    + databaseContext;

            /*
             * =====================================================
             * GROQ REQUEST
             * =====================================================
             */

            Map<String, Object> requestBody =
                    Map.of(
                            "model",
                            groqModel,

                            "messages",
                            new Object[] {

                                    Map.of(
                                            "role",
                                            "system",
                                            "content",
                                            systemPrompt
                                    ),

                                    Map.of(
                                            "role",
                                            "user",
                                            "content",
                                            userMessage
                                    )
                            },

                            "temperature",
                            0.3,

                            "max_completion_tokens",
                            1024,

                            "include_reasoning",
                            false
                    );

            /*
             * =====================================================
             * CALL GROQ
             * =====================================================
             */

            String response =
                    webClient
                            .post()
                            .uri(groqApiUrl)
                            .header(
                                    "Authorization",
                                    "Bearer " + groqApiKey
                            )
                            .header(
                                    "Content-Type",
                                    "application/json"
                            )
                            .bodyValue(requestBody)
                            .exchangeToMono(clientResponse -> {

                                HttpStatusCode status =
                                        clientResponse.statusCode();

                                return clientResponse
                                        .bodyToMono(String.class)
                                        .map(body -> {

                                            if (!status.is2xxSuccessful()) {

                                                throw new IllegalStateException(
                                                        "Groq API Error - HTTP "
                                                        + status.value()
                                                        + ": "
                                                        + body
                                                );
                                            }

                                            return body;
                                        });

                            })
                            .block();

            /*
             * =====================================================
             * PARSE GROQ RESPONSE
             * =====================================================
             */

            JsonNode jsonNode =
                    jsonMapper.readTree(response);

            JsonNode choices =
                    jsonNode.path("choices");

            if (!choices.isArray()
                    || choices.isEmpty()) {

                return new AIChatResponse(
                        "CodeSpirit AI received an invalid response from Groq."
                );
            }

            JsonNode contentNode =
                    choices
                            .get(0)
                            .path("message")
                            .path("content");

            String aiResponse =
                    contentNode.isTextual()
                            ? contentNode.textValue()
                            : null;

            if (aiResponse == null
                    || aiResponse.isBlank()) {

                return new AIChatResponse(
                        "CodeSpirit AI received an empty response from Groq."
                );
            }

            return new AIChatResponse(aiResponse);

        } catch (Exception e) {

            



            

            

            



            return new AIChatResponse(
                    "CodeSpirit AI error: " + e.getMessage()
            );
        }
    }

    /*
     * =============================================================
     * COUNT SOLVED PROBLEMS BY DIFFICULTY
     * =============================================================
     */

    private long countSolvedByDifficulty(
            Long userId,
            String difficulty) {

        List<Submission> submissions =
                submissionRepository
                        .findByUserIdOrderBySubmittedAtDesc(userId);

        long count = 0;

        java.util.Set<Long> solvedProblemIds =
                new java.util.HashSet<>();

        for (Submission submission : submissions) {

            if (submission.getStatus() != null
                    && submission.getStatus()
                            .equalsIgnoreCase("Accepted")) {

                Long problemId =
                        submission.getProblemId();

                if (problemId == null) {
                    continue;
                }

                Problem problem =
                        problemRepository
                                .findById(problemId)
                                .orElse(null);

                if (problem != null
                        && problem.getDifficulty() != null
                        && problem.getDifficulty()
                                .equalsIgnoreCase(difficulty)) {

                    solvedProblemIds.add(problemId);
                }
            }
        }

        count = solvedProblemIds.size();

        return count;
    }
}