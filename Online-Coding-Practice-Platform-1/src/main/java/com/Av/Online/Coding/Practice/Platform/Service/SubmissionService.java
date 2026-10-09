package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;


@Service

public class SubmissionService {

    public SubmissionService(SubmissionRepository submissionRepository, ProblemRepository problemRepository) {
		super();
		this.submissionRepository = submissionRepository;
		this.problemRepository = problemRepository;
	}

	private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;

    public Submission createSubmission(Submission submission) {
        return submissionRepository.save(submission);
    }

    public List<Submission> getAllSubmissions() {
        return submissionRepository.findAll();
    }

    public Submission getSubmissionById(Long id) {
        return submissionRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Submission not found"));
    }

    public List<Submission> getUserSubmissions(Long userId) {
        return submissionRepository
                .findByUserIdOrderBySubmittedAtDesc(userId);
    }

    public List<Submission> getUserProblemSubmissions(
            Long userId,
            Long problemId) {

        return submissionRepository
                .findByUserIdAndProblemIdOrderBySubmittedAtDesc(
                        userId,
                        problemId
                );
    }

    public void deleteSubmission(Long id) {

        if (!submissionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Submission not found");
        }

        submissionRepository.deleteById(id);
    }

    public long getTotalSubmissions() {
        return submissionRepository.count();
    }

    public Map<String, Object> getUserDashboardData(Long userId) {

        List<Submission> submissions =
                submissionRepository
                        .findByUserIdOrderBySubmittedAtDesc(userId);

        List<Problem> problems =
                problemRepository.findAll();

        int totalSubmissions = submissions.size();

        int acceptedSubmissions = 0;

        Set<Long> solvedProblemIds = new HashSet<>();

        for (Submission submission : submissions) {

            if (isAccepted(submission.getStatus())) {
                acceptedSubmissions++;

                solvedProblemIds.add(
                        submission.getProblemId()
                );
            }
        }

        int problemsSolved = solvedProblemIds.size();

        double acceptanceRate = 0.0;

        if (totalSubmissions > 0) {
            acceptanceRate =
                    ((double) acceptedSubmissions
                            / totalSubmissions) * 100.0;
        }

        int totalEasy = 0;
        int totalMedium = 0;
        int totalHard = 0;

        for (Problem problem : problems) {

            String difficulty =
                    problem.getDifficulty();

            if (difficulty == null) {
                continue;
            }

            if (difficulty.equalsIgnoreCase("Easy")) {
                totalEasy++;
            } else if (difficulty.equalsIgnoreCase("Medium")) {
                totalMedium++;
            } else if (difficulty.equalsIgnoreCase("Hard")) {
                totalHard++;
            }
        }

        int easySolved = 0;
        int mediumSolved = 0;
        int hardSolved = 0;

        for (Problem problem : problems) {

            if (!solvedProblemIds.contains(problem.getId())) {
                continue;
            }

            String difficulty =
                    problem.getDifficulty();

            if (difficulty == null) {
                continue;
            }

            if (difficulty.equalsIgnoreCase("Easy")) {
                easySolved++;
            } else if (difficulty.equalsIgnoreCase("Medium")) {
                mediumSolved++;
            } else if (difficulty.equalsIgnoreCase("Hard")) {
                hardSolved++;
            }
        }

        Map<String, Integer> languageUsage =
                new HashMap<>();

        languageUsage.put("Java", 0);
        languageUsage.put("Python", 0);
        languageUsage.put("C", 0);
        languageUsage.put("C++", 0);
        languageUsage.put("JavaScript", 0);

        for (Submission submission : submissions) {

            String language =
                    submission.getLanguage();

            if (language == null) {
                continue;
            }

            language =
                    language.trim().toLowerCase();

            if (language.equals("java")) {

                languageUsage.put(
                        "Java",
                        languageUsage.get("Java") + 1
                );

            } else if (language.equals("python")) {

                languageUsage.put(
                        "Python",
                        languageUsage.get("Python") + 1
                );

            } else if (language.equals("c")) {

                languageUsage.put(
                        "C",
                        languageUsage.get("C") + 1
                );

            } else if (language.equals("cpp")
                    || language.equals("c++")) {

                languageUsage.put(
                        "C++",
                        languageUsage.get("C++") + 1
                );

            } else if (language.equals("javascript")
                    || language.equals("js")) {

                languageUsage.put(
                        "JavaScript",
                        languageUsage.get("JavaScript") + 1
                );
            }
        }

        Set<LocalDate> submissionDates =
                new HashSet<>();

        for (Submission submission : submissions) {

            if (submission.getSubmittedAt() != null) {

                submissionDates.add(
                        submission.getSubmittedAt().toLocalDate()
                );
            }
        }

        int codingStreak =
                calculateCodingStreak(submissionDates);

        Map<String, Integer> heatmap =
                new HashMap<>();

        for (Submission submission : submissions) {

            if (submission.getSubmittedAt() == null) {
                continue;
            }

            String date =
                    submission.getSubmittedAt()
                            .toLocalDate()
                            .toString();

            heatmap.put(
                    date,
                    heatmap.getOrDefault(date, 0) + 1
            );
        }

        Map<String, Object> dashboard =
                new HashMap<>();

        dashboard.put(
                "totalSubmissions",
                totalSubmissions
        );

        dashboard.put(
                "acceptedSubmissions",
                acceptedSubmissions
        );

        dashboard.put(
                "problemsSolved",
                problemsSolved
        );

        dashboard.put(
                "acceptanceRate",
                Math.round(acceptanceRate * 100.0)
                        / 100.0
        );

        dashboard.put(
                "codingStreak",
                codingStreak
        );

        dashboard.put(
                "easySolved",
                easySolved
        );

        dashboard.put(
                "mediumSolved",
                mediumSolved
        );

        dashboard.put(
                "hardSolved",
                hardSolved
        );

        dashboard.put(
                "totalEasy",
                totalEasy
        );

        dashboard.put(
                "totalMedium",
                totalMedium
        );

        dashboard.put(
                "totalHard",
                totalHard
        );

        dashboard.put(
                "languageUsage",
                languageUsage
        );

        dashboard.put(
                "heatmap",
                heatmap
        );

        dashboard.put(
                "recentSubmissions",
                submissions.stream()
                        .limit(5)
                        .toList()
        );

        return dashboard;
    }

    private boolean isAccepted(String status) {

        if (status == null) {
            return false;
        }

        String normalized =
                status.trim().toLowerCase();

        if (normalized.equals("accepted")
                || normalized.contains("accepted")
                || normalized.equals("success")) {
            return true;
        }

        return false;
    }

    private int calculateCodingStreak(
            Set<LocalDate> submissionDates) {

        if (submissionDates.isEmpty()) {
            return 0;
        }

        LocalDate currentDate =
                LocalDate.now();

        if (!submissionDates.contains(currentDate)) {
            currentDate =
                    currentDate.minusDays(1);
        }

        int streak = 0;

        while (submissionDates.contains(currentDate)) {

            streak++;

            currentDate =
                    currentDate.minusDays(1);
        }

        return streak;
    }
}
