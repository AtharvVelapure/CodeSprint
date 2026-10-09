package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentCandidateSessionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentInvitationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificateRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationAttemptRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ContestParticipantRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ContestRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;
import com.Av.Online.Coding.Practice.Platform.entity.Certificate;
import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationAttempt;
import com.Av.Online.Coding.Practice.Platform.entity.Contest;
import com.Av.Online.Coding.Practice.Platform.entity.ContestParticipant;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;
import com.Av.Online.Coding.Practice.Platform.entity.User;

@Service
public class AdminReportsService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;
    private final ContestRepository contestRepository;
    private final ContestParticipantRepository contestParticipantRepository;
    private final AssessmentAssignmentRepository assessmentAssignmentRepository;
    private final AssessmentInvitationRepository assessmentInvitationRepository;
    private final AssessmentCandidateSessionRepository assessmentCandidateSessionRepository;
    private final CertificationRepository certificationRepository;
    private final CertificationAttemptRepository certificationAttemptRepository;
    private final CertificateRepository certificateRepository;

    public AdminReportsService(
            UserRepository userRepository,
            ProblemRepository problemRepository,
            SubmissionRepository submissionRepository,
            ContestRepository contestRepository,
            ContestParticipantRepository contestParticipantRepository,
            AssessmentAssignmentRepository assessmentAssignmentRepository,
            AssessmentInvitationRepository assessmentInvitationRepository,
            AssessmentCandidateSessionRepository assessmentCandidateSessionRepository,
            CertificationRepository certificationRepository,
            CertificationAttemptRepository certificationAttemptRepository,
            CertificateRepository certificateRepository) {

        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
        this.contestRepository = contestRepository;
        this.contestParticipantRepository = contestParticipantRepository;
        this.assessmentAssignmentRepository = assessmentAssignmentRepository;
        this.assessmentInvitationRepository = assessmentInvitationRepository;
        this.assessmentCandidateSessionRepository = assessmentCandidateSessionRepository;
        this.certificationRepository = certificationRepository;
        this.certificationAttemptRepository = certificationAttemptRepository;
        this.certificateRepository = certificateRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getReports() {

        List<User> users = userRepository.findAll();

        List<Problem> problems = problemRepository.findAll();

        List<Submission> submissions = submissionRepository.findAll();

        List<Contest> contests = contestRepository.findAll();

        List<ContestParticipant> contestParticipants =
                contestParticipantRepository.findAll();

        List<AssessmentAssignment> assessments =
                assessmentAssignmentRepository.findAll();

        List<AssessmentInvitation> invitations =
                assessmentInvitationRepository.findAll();

        List<AssessmentCandidateSession> assessmentSessions =
                assessmentCandidateSessionRepository.findAll();

        List<Certification> certifications =
                certificationRepository.findAll();

        List<CertificationAttempt> certificationAttempts =
                certificationAttemptRepository.findAll();

        List<Certificate> certificates =
                certificateRepository.findAll();

        Map<String, Object> report =
                new LinkedHashMap<>();

        report.put(
                "generatedAt",
                LocalDateTime.now().toString()
        );

        report.put(
                "users",
                buildUserReport(users)
        );

        report.put(
                "problems",
                buildProblemSummary(problems)
        );

        report.put(
                "submissions",
                buildSubmissionReport(submissions)
        );

        report.put(
                "contests",
                buildContestReport(
                        contests,
                        contestParticipants
                )
        );

        report.put(
                "assessments",
                buildAssessmentReport(
                        assessments,
                        invitations,
                        assessmentSessions
                )
        );

        report.put(
                "certifications",
                buildCertificationReport(
                        certifications,
                        certificationAttempts,
                        certificates
                )
        );

        report.put(
                "problemAnalytics",
                buildProblemAnalytics(
                        problems,
                        submissions
                )
        );

        return report;
    }

    private Map<String, Object> buildUserReport(
            List<User> users) {

        long active =
                users.stream()
                        .filter(user ->
                                Boolean.TRUE.equals(
                                        user.isActive()
                                )
                        )
                        .count();

        long inactive =
                users.size() - active;

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("total", users.size());
        result.put("active", active);
        result.put("inactive", inactive);

        return result;
    }

    private Map<String, Object> buildProblemSummary(
            List<Problem> problems) {

        long easy =
                countProblemsByDifficulty(
                        problems,
                        "easy"
                );

        long medium =
                countProblemsByDifficulty(
                        problems,
                        "medium"
                );

        long hard =
                countProblemsByDifficulty(
                        problems,
                        "hard"
                );

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("total", problems.size());
        result.put("easy", easy);
        result.put("medium", medium);
        result.put("hard", hard);

        return result;
    }

    private Map<String, Object> buildSubmissionReport(
            List<Submission> submissions) {

        long accepted =
                submissions.stream()
                        .filter(this::isAccepted)
                        .count();

        double acceptanceRate =
                submissions.isEmpty()
                        ? 0.0
                        : (accepted * 100.0)
                                / submissions.size();

        Map<String, Long> byStatus =
                new LinkedHashMap<>();

        for (Submission submission : submissions) {

            String status =
                    normalizeLabel(
                            submission.getStatus(),
                            "Unknown"
                    );

            byStatus.merge(
                    status,
                    1L,
                    Long::sum
            );
        }

        Map<String, Long> languageUsage =
                new LinkedHashMap<>();

        for (Submission submission : submissions) {

            String language =
                    normalizeLanguage(
                            submission.getLanguage()
                    );

            languageUsage.merge(
                    language,
                    1L,
                    Long::sum
            );
        }

        List<Map<String, Object>> last7Days =
                buildSubmissionTrend(
                        submissions,
                        7
                );

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put("total", submissions.size());
        result.put("accepted", accepted);

        result.put(
                "acceptanceRate",
                round2(acceptanceRate)
        );

        result.put(
                "byStatus",
                byStatus
        );

        result.put(
                "languageUsage",
                languageUsage
        );

        result.put(
                "last7Days",
                last7Days
        );

        return result;
    }

    private List<Map<String, Object>> buildSubmissionTrend(
            List<Submission> submissions,
            int days) {

        List<Map<String, Object>> result =
                new ArrayList<>();

        LocalDate today =
                LocalDate.now();

        for (int i = days - 1; i >= 0; i--) {

            LocalDate date =
                    today.minusDays(i);

            long count =
                    submissions.stream()
                            .filter(submission ->
                                    submission.getSubmittedAt() != null
                                    && submission
                                            .getSubmittedAt()
                                            .toLocalDate()
                                            .equals(date)
                            )
                            .count();

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "date",
                    date.toString()
            );

            item.put(
                    "label",
                    date.getDayOfMonth()
                            + " "
                            + date.getMonth()
                                    .toString()
                                    .substring(0, 1)
                                    .toUpperCase()
                            + date.getMonth()
                                    .toString()
                                    .substring(1, 3)
                                    .toLowerCase()
            );

            item.put(
                    "count",
                    count
            );

            result.add(item);
        }

        return result;
    }

    private Map<String, Object> buildContestReport(
            List<Contest> contests,
            List<ContestParticipant> participants) {

        Map<String, Long> statusCounts =
                new LinkedHashMap<>();

        for (Contest contest : contests) {

            String status =
                    normalizeLabel(
                            contest.getStatus(),
                            "Unknown"
                    );

            statusCounts.merge(
                    status,
                    1L,
                    Long::sum
            );
        }

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "total",
                contests.size()
        );

        result.put(
                "participants",
                participants.size()
        );

        result.put(
                "statusCounts",
                statusCounts
        );

        return result;
    }

    private Map<String, Object> buildAssessmentReport(
            List<AssessmentAssignment> assessments,
            List<AssessmentInvitation> invitations,
            List<AssessmentCandidateSession> sessions) {

        long nonDeletedAssessments =
                assessments.stream()
                        .filter(assessment ->
                                !Boolean.TRUE.equals(
                                        assessment.getDeleted()
                                )
                        )
                        .count();

        Map<String, Long> statusCounts =
                new LinkedHashMap<>();

        for (AssessmentAssignment assessment :
                assessments) {

            if (Boolean.TRUE.equals(
                    assessment.getDeleted())) {

                continue;
            }

            String status =
                    normalizeLabel(
                            assessment.getStatus(),
                            "Unknown"
                    );

            statusCounts.merge(
                    status,
                    1L,
                    Long::sum
            );
        }

        long submittedSessions =
                sessions.stream()
                        .filter(session ->
                                hasStatus(
                                        session,
                                        "SUBMITTED"
                                )
                        )
                        .count();

        long expiredSessions =
                sessions.stream()
                        .filter(session ->
                                hasStatus(
                                        session,
                                        "TIME_EXPIRED"
                                )
                        )
                        .count();

        long inProgressSessions =
                sessions.stream()
                        .filter(session ->
                                hasStatus(
                                        session,
                                        "IN_PROGRESS"
                                )
                        )
                        .count();

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "total",
                nonDeletedAssessments
        );

        result.put(
                "invitations",
                invitations.size()
        );

        result.put(
                "sessions",
                sessions.size()
        );

        result.put(
                "submittedSessions",
                submittedSessions
        );

        result.put(
                "expiredSessions",
                expiredSessions
        );

        result.put(
                "inProgressSessions",
                inProgressSessions
        );

        result.put(
                "statusCounts",
                statusCounts
        );

        return result;
    }

    private Map<String, Object> buildCertificationReport(
            List<Certification> certifications,
            List<CertificationAttempt> attempts,
            List<Certificate> certificates) {

        Map<String, Long> certificationStatusCounts =
                new LinkedHashMap<>();

        for (Certification certification :
                certifications) {

            String status =
                    normalizeLabel(
                            certification.getStatus(),
                            "Unknown"
                    );

            certificationStatusCounts.merge(
                    status,
                    1L,
                    Long::sum
            );
        }

        long passed =
                attempts.stream()
                        .filter(attempt ->
                                hasAnyStatus(
                                        attempt,
                                        "PASS",
                                        "PASSED",
                                        "SUCCESS"
                                )
                        )
                        .count();

        long failed =
                attempts.stream()
                        .filter(attempt ->
                                hasAnyStatus(
                                        attempt,
                                        "FAIL",
                                        "FAILED"
                                )
                        )
                        .count();

        long timeExpired =
                attempts.stream()
                        .filter(attempt ->
                                hasAnyStatus(
                                        attempt,
                                        "TIME_EXPIRED",
                                        "TIMEOUT",
                                        "EXPIRED"
                                )
                        )
                        .count();

        long inProgress =
                attempts.stream()
                        .filter(attempt ->
                                hasAnyStatus(
                                        attempt,
                                        "IN_PROGRESS"
                                )
                        )
                        .count();

        Map<String, Long> attemptStatusCounts =
                new LinkedHashMap<>();

        for (CertificationAttempt attempt :
                attempts) {

            String status =
                    normalizeLabel(
                            attempt.getStatus(),
                            "Unknown"
                    );

            attemptStatusCounts.merge(
                    status,
                    1L,
                    Long::sum
            );
        }

        Map<String, Object> result =
                new LinkedHashMap<>();

        result.put(
                "total",
                certifications.size()
        );

        result.put(
                "attempts",
                attempts.size()
        );

        result.put(
                "passedAttempts",
                passed
        );

        result.put(
                "failedAttempts",
                failed
        );

        result.put(
                "timeExpiredAttempts",
                timeExpired
        );

        result.put(
                "inProgressAttempts",
                inProgress
        );

        result.put(
                "certificatesIssued",
                certificates.size()
        );

        result.put(
                "statusCounts",
                certificationStatusCounts
        );

        result.put(
                "attemptStatusCounts",
                attemptStatusCounts
        );

        return result;
    }

    private List<Map<String, Object>> buildProblemAnalytics(
            List<Problem> problems,
            List<Submission> submissions) {

        Map<Long, Long> attemptsByProblem =
                new LinkedHashMap<>();

        Map<Long, Long> acceptedByProblem =
                new LinkedHashMap<>();

        for (Submission submission :
                submissions) {

            Long problemId =
                    submission.getProblemId();

            if (problemId == null) {
                continue;
            }

            attemptsByProblem.merge(
                    problemId,
                    1L,
                    Long::sum
            );

            if (isAccepted(submission)) {

                acceptedByProblem.merge(
                        problemId,
                        1L,
                        Long::sum
                );
            }
        }

        List<Map<String, Object>> analytics =
                new ArrayList<>();

        for (Problem problem : problems) {

            Long id =
                    problem.getId();

            long attempts =
                    attemptsByProblem
                            .getOrDefault(
                                    id,
                                    0L
                            );

            long accepted =
                    acceptedByProblem
                            .getOrDefault(
                                    id,
                                    0L
                            );

            double acceptanceRate =
                    attempts == 0
                            ? 0.0
                            : (accepted * 100.0)
                                    / attempts;

            Map<String, Object> item =
                    new LinkedHashMap<>();

            item.put(
                    "id",
                    id
            );

            item.put(
                    "title",
                    problem.getTitle()
            );

            item.put(
                    "difficulty",
                    normalizeLabel(
                            problem.getDifficulty(),
                            "Unknown"
                    )
            );

            item.put(
                    "category",
                    normalizeLabel(
                            problem.getCategory(),
                            "Unknown"
                    )
            );

            item.put(
                    "attempts",
                    attempts
            );

            item.put(
                    "accepted",
                    accepted
            );

            item.put(
                    "acceptanceRate",
                    round2(acceptanceRate)
            );

            analytics.add(item);
        }

        analytics.sort(
                Comparator
                        .comparingLong(
                                (
                                        Map<String, Object> item
                                ) ->
                                        (
                                                (Number) item
                                                        .get("attempts")
                                        ).longValue()
                        )
                        .reversed()
                        .thenComparing(
                                item ->
                                        String.valueOf(
                                                item.get("title")
                                        ),
                                String.CASE_INSENSITIVE_ORDER
                        )
        );

        return analytics;
    }

    private boolean isAccepted(
            Submission submission) {

        String status =
                submission.getStatus();

        if (status == null) {
            return false;
        }

        return status
                .trim()
                .toLowerCase()
                .contains("accepted");
    }

    private long countProblemsByDifficulty(
            List<Problem> problems,
            String expected) {

        return problems.stream()
                .filter(problem ->
                        problem.getDifficulty() != null
                        && problem.getDifficulty()
                                .trim()
                                .equalsIgnoreCase(
                                        expected
                                )
                )
                .count();
    }

    private boolean hasStatus(
            AssessmentCandidateSession session,
            String expected) {

        return session != null
                && session.getStatus() != null
                && session.getStatus()
                        .toString()
                        .trim()
                        .equalsIgnoreCase(
                                expected
                        );
    }

    private boolean hasAnyStatus(
            CertificationAttempt attempt,
            String... expectedStatuses) {

        if (attempt == null
                || attempt.getStatus() == null) {

            return false;
        }

        String actual =
                attempt.getStatus()
                        .toString()
                        .trim();

        for (String expected :
                expectedStatuses) {

            if (actual.equalsIgnoreCase(
                    expected)) {

                return true;
            }
        }

        return false;
    }

    private String normalizeStatus(
            Object value) {

        if (value == null) {
            return "UNKNOWN";
        }

        String text =
                value.toString().trim();

        if (text.isEmpty()) {
            return "UNKNOWN";
        }

        return text
                .toUpperCase()
                .replace('-', '_')
                .replace(' ', '_');
    }

    private String normalizeLabel(
            Object value,
            String fallback) {

        if (value == null) {
            return fallback;
        }

        String text =
                value.toString().trim();

        if (text.isEmpty()) {
            return fallback;
        }

        String normalized =
                normalizeStatus(text);

        String[] words =
                normalized
                        .replace('_', ' ')
                        .toLowerCase()
                        .split("\\s+");

        StringBuilder builder =
                new StringBuilder();

        for (String word : words) {

            if (word.isEmpty()) {
                continue;
            }

            if (!builder.isEmpty()) {
                builder.append(' ');
            }

            builder.append(
                    Character.toUpperCase(
                            word.charAt(0)
                    )
            );

            if (word.length() > 1) {

                builder.append(
                        word.substring(1)
                );
            }
        }

        return builder.toString();
    }

    private String normalizeLanguage(
            String value) {

        if (value == null
                || value.trim().isEmpty()) {

            return "Unknown";
        }

        String language =
                value.trim().toLowerCase();

        return switch (language) {

            case "java" ->
                    "Java";

            case "python", "py" ->
                    "Python";

            case "cpp", "c++" ->
                    "C++";

            case "javascript", "js" ->
                    "JavaScript";

            case "c" ->
                    "C";

            default ->
                    value.trim();
        };
    }

    private double round2(
            double value) {

        return Math.round(
                value * 100.0
        ) / 100.0;
    }
}