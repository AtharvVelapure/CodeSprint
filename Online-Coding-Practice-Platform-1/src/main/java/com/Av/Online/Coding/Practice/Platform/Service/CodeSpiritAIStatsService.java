package com.Av.Online.Coding.Practice.Platform.Service;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AIUserStatsResponse;

@Service
public class CodeSpiritAIStatsService {

    private final SubmissionRepository submissionRepository;

    public CodeSpiritAIStatsService(
            SubmissionRepository submissionRepository) {

        this.submissionRepository = submissionRepository;
    }

    public AIUserStatsResponse getUserStats(Long userId) {

        long totalSolved =
                submissionRepository.countSolvedProblemsByUserId(userId);

        long totalAttempted =
                submissionRepository.countAttemptedProblemsByUserId(userId);

        long totalSubmissions =
                submissionRepository.countByUserId(userId);

        return new AIUserStatsResponse(
                totalSolved,
                totalAttempted,
                totalSubmissions
        );
    }
}