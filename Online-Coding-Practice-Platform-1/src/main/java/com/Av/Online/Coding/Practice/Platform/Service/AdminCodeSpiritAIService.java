package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.Duration;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.Av.Online.Coding.Practice.Platform.Repository.CertificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ContestRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AIChatResponse;
import com.Av.Online.Coding.Practice.Platform.entity.ContestStatus;
import com.Av.Online.Coding.Practice.Platform.entity.Role;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Service
public class AdminCodeSpiritAIService {

    private final WebClient webClient;
    private final JsonMapper jsonMapper;

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final ContestRepository contestRepository;
    private final CertificationRepository certificationRepository;

    @Value("${groq.api.key}")
    private String groqApiKey;

    @Value("${groq.api.url}")
    private String groqApiUrl;

    @Value("${groq.model}")
    private String groqModel;

    public AdminCodeSpiritAIService(
            WebClient.Builder webClientBuilder,
            JsonMapper jsonMapper,
            UserRepository userRepository,
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository,
            ContestRepository contestRepository,
            CertificationRepository certificationRepository) {

        this.webClient = webClientBuilder.build();
        this.jsonMapper = jsonMapper;

        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.contestRepository = contestRepository;
        this.certificationRepository = certificationRepository;
    }

    public AIChatResponse chat(String adminMessage) {

        try {

            String normalizedMessage =
                    adminMessage.toLowerCase().trim();

            String databaseContext = "";

            /*
             * =====================================================
             * USER STATISTICS
             * =====================================================
             */

            boolean asksAboutUsers =
                    normalizedMessage.contains("user")
                    || normalizedMessage.contains("users")
                    || normalizedMessage.contains("active user")
                    || normalizedMessage.contains("inactive user");

            /*
             * =====================================================
             * PROBLEM STATISTICS
             * =====================================================
             */

            boolean asksAboutProblems =
                    normalizedMessage.contains("problem")
                    || normalizedMessage.contains("problems");

            /*
             * =====================================================
             * SUBMISSION STATISTICS
             * =====================================================
             */

            boolean asksAboutSubmissions =
                    normalizedMessage.contains("submission")
                    || normalizedMessage.contains("submissions")
                    || normalizedMessage.contains("acceptance rate");

            /*
             * =====================================================
             * CONTEST STATISTICS
             * =====================================================
             */

            boolean asksAboutContests =
                    normalizedMessage.contains("contest")
                    || normalizedMessage.contains("contests");

            /*
             * =====================================================
             * CERTIFICATION STATISTICS
             * =====================================================
             */

            boolean asksAboutCertifications =
                    normalizedMessage.contains("certification")
                    || normalizedMessage.contains("certifications");

            /*
             * =====================================================
             * USERS
             * =====================================================
             */

            if (asksAboutUsers) {

                long totalUsers =
                        userRepository.countByRole(Role.USER);

                long activeUsers =
                        userRepository.countByActiveAndRole(
                                true,
                                Role.USER
                        );

                long inactiveUsers =
                        userRepository.countByActiveAndRole(
                                false,
                                Role.USER
                        );

                databaseContext = """
                        ADMIN PLATFORM DATA - USERS

                        IMPORTANT:
                        User statistics include ONLY accounts with role USER.
                        ADMIN accounts must NOT be included.

                        Total users: %d
                        Active users: %d
                        Inactive users: %d

                        These values come directly from the CodeSprint database.

                        Do not invent or modify these numbers.
                        """.formatted(
                                totalUsers,
                                activeUsers,
                                inactiveUsers
                        );
            }
            /*
             * =====================================================
             * PROBLEMS
             * =====================================================
             */

            else if (asksAboutProblems) {

                long totalProblems =
                        problemRepository.count();

                long easyProblems =
                        problemRepository
                                .countByDifficultyIgnoreCase("Easy");

                long mediumProblems =
                        problemRepository
                                .countByDifficultyIgnoreCase("Medium");

                long hardProblems =
                        problemRepository
                                .countByDifficultyIgnoreCase("Hard");

                databaseContext = """
                        ADMIN PLATFORM DATA - PROBLEMS

                        Total problems: %d
                        Easy problems: %d
                        Medium problems: %d
                        Hard problems: %d

                        These values come directly from the
                        CodeSprint database.

                        Do not invent or modify these numbers.
                        """.formatted(
                                totalProblems,
                                easyProblems,
                                mediumProblems,
                                hardProblems
                        );
            }

            /*
             * =====================================================
             * SUBMISSIONS
             * =====================================================
             */

            else if (asksAboutSubmissions) {

                long totalSubmissions =
                        submissionRepository.count();

                long acceptedSubmissions =
                        submissionRepository
                                .countAcceptedSubmissions();

                double acceptanceRate =
                        totalSubmissions > 0
                                ? ((double) acceptedSubmissions
                                    / totalSubmissions) * 100.0
                                : 0.0;

                databaseContext = """
                        ADMIN PLATFORM DATA - SUBMISSIONS

                        Total submissions: %d
                        Accepted submissions: %d
                        Acceptance rate: %.2f%%

                        These values come directly from the
                        CodeSprint database.

                        Do not invent or modify these numbers.
                        """.formatted(
                                totalSubmissions,
                                acceptedSubmissions,
                                acceptanceRate
                        );
            }

            /*
             * =====================================================
             * CONTESTS
             * =====================================================
             */

            else if (asksAboutContests) {

                long totalContests =
                        contestRepository.count();

                long upcomingContests =
                        contestRepository.countByStatus(
                                ContestStatus.UPCOMING
                        );

                long activeContests =
                        contestRepository.countByStatus(
                                ContestStatus.LIVE
                        );

                long completedContests =
                        contestRepository.countByStatus(
                                ContestStatus.FINISHED
                        );

                databaseContext = """
                        ADMIN PLATFORM DATA - CONTESTS

                        Total contests: %d
                        Upcoming contests: %d
                        Active contests: %d
                        Completed contests: %d

                        These values come directly from the
                        CodeSprint database.

                        Do not invent or modify these numbers.
                        """.formatted(
                                totalContests,
                                upcomingContests,
                                activeContests,
                                completedContests
                        );
            }

            /*
             * =====================================================
             * CERTIFICATIONS
             * =====================================================
             */

            else if (asksAboutCertifications) {

                long totalCertifications =
                        certificationRepository.count();

                databaseContext = """
                        ADMIN PLATFORM DATA - CERTIFICATIONS

                        Total certifications: %d

                        The certification entity currently stores
                        status as a String, but no fixed set of
                        status values has been defined for this
                        AI integration.

                        Therefore, only the total certification
                        count is provided.

                        This value comes directly from the
                        CodeSprint database.

                        Do not invent or modify this number.
                        """.formatted(
                                totalCertifications
                        );
            }

            /*
             * =====================================================
             * SYSTEM PROMPT
             * =====================================================
             */

            String systemPrompt = """
                    You are CodeSpirit AI, the official AI assistant
                    for CodeSprint administrators.

                    Help administrators understand the platform
                    using the database information provided to you.

                    IMPORTANT RULES:

                    - Never invent statistics.
                    - Never modify database values.
                    - Use database values exactly as provided.
                    - Do not assume missing information.
                    - Do not claim access to data that was not provided.
                    - Keep responses concise and professional.
                    - Clearly explain numbers when useful.
                    - For general programming questions, answer normally.
                    - Do not expose passwords or sensitive user information.
                    - Do not list individual users unless that data is
                      explicitly provided.
                    - Do not invent certification status values.

                    DATABASE CONTEXT:

                    """ + databaseContext;

            /*
             * =====================================================
             * DEBUG INFORMATION
             * =====================================================
             */

            
            
            
            
            
            



            
            
            
            

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
                                            adminMessage
                                    )
                            },

                            "temperature",
                            0.2,

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
                            .retrieve()

                            .onStatus(
                                    HttpStatusCode::isError,
                                    clientResponse ->
                                            clientResponse
                                                    .bodyToMono(String.class)
                                                    .map(body ->
                                                            new IllegalStateException(
                                                                    "Groq API Error - HTTP "
                                                                    + clientResponse
                                                                            .statusCode()
                                                                            .value()
                                                                    + ": "
                                                                    + body
                                                            )
                                                    )
                            )

                            .bodyToMono(String.class)

                            .timeout(Duration.ofSeconds(60))

                            .block();

            /*
             * =====================================================
             * CHECK RESPONSE
             * =====================================================
             */

            if (response == null || response.isBlank()) {

                return new AIChatResponse(
                        "CodeSpirit AI received an empty response from Groq."
                );
            }

            
            
            

            /*
             * =====================================================
             * PARSE RESPONSE
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

            /*
             * =====================================================
             * ERROR LOGGING
             * =====================================================
             */

            
            



            




            




            if (e.getCause() != null) {

                




                



            }

            

            



            return new AIChatResponse(
                    "CodeSpirit AI error: "
                    + (e.getMessage() != null
                            ? e.getMessage()
                            : "Unknown error")
            );
        }
    }
}