package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.LeaderboardResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.Role;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;
import com.Av.Online.Coding.Practice.Platform.entity.User;

@Service
public class LeaderboardService {

    private final UserRepository userRepository;
    private final SubmissionRepository submissionRepository;
    private final ProblemRepository problemRepository;

    public LeaderboardService(
            UserRepository userRepository,
            SubmissionRepository submissionRepository,
            ProblemRepository problemRepository) {

        this.userRepository = userRepository;
        this.submissionRepository = submissionRepository;
        this.problemRepository = problemRepository;
    }

    // ========================================
    // GET GLOBAL LEADERBOARD
    // ========================================

    public List<LeaderboardResponse> getGlobalLeaderboard() {

        List<User> users = userRepository.findAll();

        List<Problem> problems = problemRepository.findAll();

        // ========================================
        // CREATE PROBLEM LOOKUP
        // ========================================

        Map<Long, Problem> problemMap = new HashMap<>();

        for (Problem problem : problems) {

            problemMap.put(
                    problem.getId(),
                    problem
            );
        }

        // ========================================
        // LEADERBOARD DATA
        // ========================================

        List<LeaderboardResponse> leaderboard =
                new ArrayList<>();

        for (User user : users) {

            // ====================================
            // SKIP ADMIN
            // ====================================

            if (user.getRole() == Role.ADMIN) {
                continue;
            }

            // ====================================
            // SKIP INACTIVE USERS
            // ====================================

            if (!user.isActive()) {
                continue;
            }

            List<Submission> submissions =
                    submissionRepository
                            .findByUserIdOrderBySubmittedAtDesc(
                                    user.getId()
                            );

            // ====================================
            // STATISTICS
            // ====================================

            int totalSubmissions = submissions.size();

            int acceptedSubmissions = 0;

            Set<Long> solvedProblemIds = new HashSet<>();

            int easySolved = 0;
            int mediumSolved = 0;
            int hardSolved = 0;

            int points = 0;

            // ====================================
            // PROCESS SUBMISSIONS
            // ====================================

            for (Submission submission : submissions) {

                if (!isAccepted(
                        submission.getStatus()
                )) {
                    continue;
                }

                acceptedSubmissions++;

                Long problemId =
                        submission.getProblemId();

                // ====================================
                // ONLY FIRST ACCEPTED SOLUTION
                // COUNTS FOR SOLVING + POINTS
                // ====================================

                if (!solvedProblemIds.add(problemId)) {
                    continue;
                }

                Problem problem =
                        problemMap.get(problemId);

                if (problem == null) {
                    continue;
                }

                String difficulty =
                        problem.getDifficulty();

                if (difficulty == null) {
                    continue;
                }

                if (difficulty.equalsIgnoreCase("Easy")) {

                    easySolved++;

                    points += 100;

                } else if (
                        difficulty.equalsIgnoreCase("Medium")
                ) {

                    mediumSolved++;

                    points += 200;

                } else if (
                        difficulty.equalsIgnoreCase("Hard")
                ) {

                    hardSolved++;

                    points += 300;
                }
            }
                        
            int problemsSolved = 0;

            for (Submission submission : submissions) {

                if (!isAccepted(submission.getStatus())) {
                    continue;
                }

                acceptedSubmissions++;

                Long problemId = submission.getProblemId();

                if (!solvedProblemIds.add(problemId)) {
                    continue;
                }

                Problem problem = problemMap.get(problemId);

                if (problem == null) {
                    continue;
                }

                String difficulty = problem.getDifficulty();

                if (difficulty == null) {
                    continue;
                }

                problemsSolved++;

                if (difficulty.equalsIgnoreCase("Easy")) {
                    easySolved++;
                    points += 100;
                } else if (difficulty.equalsIgnoreCase("Medium")) {
                    mediumSolved++;
                    points += 200;
                } else if (difficulty.equalsIgnoreCase("Hard")) {
                    hardSolved++;
                    points += 300;
                }
            }

            // ====================================
            // CREATE LEADERBOARD RESPONSE
            // ====================================

            LeaderboardResponse response = new LeaderboardResponse(0,
             user.getId(),user.getName(), user.getEmail(),
            problemsSolved,acceptedSubmissions,totalSubmissions,
            easySolved,mediumSolved,hardSolved, points);

            leaderboard.add(response);
        }

        // ========================================
        // SORT LEADERBOARD
        // ========================================

        leaderboard.sort(
                Comparator
                        .comparingInt(
                                LeaderboardResponse::getPoints
                        )
                        .reversed()

                        .thenComparingInt(
                                LeaderboardResponse::getProblemsSolved
                        )
                        .reversed()

                        .thenComparingInt(
                                LeaderboardResponse::getAcceptedSubmissions
                        )
                        .reversed()
        );

        // ========================================
        // ASSIGN RANK
        // ========================================

        int rank = 1;

        for (LeaderboardResponse response : leaderboard) {

            response.setRank(rank);

            rank++;
        }

        return leaderboard;
    }

    // ========================================
    // GET USER RANK
    // ========================================

    public LeaderboardResponse getUserLeaderboard(
            Long userId) {

        List<LeaderboardResponse> leaderboard =
                getGlobalLeaderboard();

        return leaderboard
                .stream()
                .filter(
                        item ->
                                item.getUserId()
                                        .equals(userId)
                )
                .findFirst()
                .orElse(null);
    }

    // ========================================
    // CHECK ACCEPTED
    // ========================================

    private boolean isAccepted(String status) {

        if (status == null) {
            return false;
        }

        String value =
                status
                        .trim()
                        .toLowerCase();

        return value.equals("accepted")
                || value.contains("accepted")
                || value.equals("success");
    }
}