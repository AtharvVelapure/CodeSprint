package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ContestParticipantRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ContestProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ContestRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.dto.ContestLeaderboardResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Contest;
import com.Av.Online.Coding.Practice.Platform.entity.ContestParticipant;
import com.Av.Online.Coding.Practice.Platform.entity.ContestProblem;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class ContestLeaderboardService {

    private final ContestRepository contestRepository;
    private final ContestParticipantRepository contestParticipantRepository;
    private final ContestProblemRepository contestProblemRepository;
    private final SubmissionRepository submissionRepository;

    public ContestLeaderboardService(
            ContestRepository contestRepository,
            ContestParticipantRepository contestParticipantRepository,
            ContestProblemRepository contestProblemRepository,
            SubmissionRepository submissionRepository) {

        this.contestRepository = contestRepository;
        this.contestParticipantRepository = contestParticipantRepository;
        this.contestProblemRepository = contestProblemRepository;
        this.submissionRepository = submissionRepository;
    }

    public List<ContestLeaderboardResponse> getContestLeaderboard(Long contestId) {

        Contest contest = contestRepository
                .findById(contestId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Contest not found"));

        List<ContestParticipant> participants =
                contestParticipantRepository
                        .findByContestOrderByScoreDesc(contest);

        List<ContestProblem> contestProblems =
                contestProblemRepository
                        .findByContestOrderByProblemOrderAsc(contest);

        Set<Long> contestProblemIds = new HashSet<>();

        for (ContestProblem contestProblem : contestProblems) {
            contestProblemIds.add(
                    contestProblem.getProblem().getId()
            );
        }

        List<ContestLeaderboardResponse> leaderboard =
                new ArrayList<>();

        for (ContestParticipant participant : participants) {

            Long userId =
                    participant.getUser().getId();

            List<Submission> submissions =
                    submissionRepository
                            .findByContestIdAndUserIdOrderBySubmittedAtDesc(
                                    contestId,
                                    userId
                            );

            Set<Long> solvedProblems =
                    new HashSet<>();

            int totalSubmissions = 0;

            for (Submission submission : submissions) {

                if (!contestProblemIds.contains(
                        submission.getProblemId())) {
                    continue;
                }

                totalSubmissions++;

                if (isAccepted(submission.getStatus())) {
                    solvedProblems.add(
                            submission.getProblemId()
                    );
                }
            }

            ContestLeaderboardResponse response =
                    new ContestLeaderboardResponse(
                            0,
                            userId,
                            participant.getUser().getName(),
                            participant.getUser().getEmail(),
                            participant.getScore() == null
                                    ? 0
                                    : participant.getScore(),
                            solvedProblems.size(),
                            totalSubmissions
                    );

            leaderboard.add(response);
        }

        // Ranking:
        // 1. Higher score
        // 2. More problems solved
        // 3. Fewer submissions
        // 4. Lower user ID for deterministic ordering
        leaderboard.sort(
                Comparator
                        .comparingInt(
                                ContestLeaderboardResponse::getScore
                        )
                        .reversed()
                        .thenComparing(
                                Comparator.comparingInt(
                                        ContestLeaderboardResponse::getProblemsSolved
                                ).reversed()
                        )
                        .thenComparingInt(
                                ContestLeaderboardResponse::getTotalSubmissions
                        )
                        .thenComparing(
                                ContestLeaderboardResponse::getUserId
                        )
        );

        int rank = 1;

        for (ContestLeaderboardResponse response : leaderboard) {
            response.setRank(rank++);
        }

        return leaderboard;
    }

    public ContestLeaderboardResponse getUserContestLeaderboard(
            Long contestId,
            Long userId) {

        List<ContestLeaderboardResponse> leaderboard =
                getContestLeaderboard(contestId);

        return leaderboard.stream()
                .filter(response ->
                        response.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() ->
                        new ForbiddenException(
                                "User is not registered for this contest"
                        )
                );
    }

    private boolean isAccepted(String status) {

        if (status == null) {
            return false;
        }

        String normalized =
                status.trim().toLowerCase();

        return normalized.equals("accepted")
                || normalized.equals("success")
                || normalized.contains("accepted");
    }
}
