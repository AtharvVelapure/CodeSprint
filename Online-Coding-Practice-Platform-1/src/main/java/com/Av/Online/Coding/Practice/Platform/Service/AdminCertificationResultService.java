package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.CertificationAttemptRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AdminCertificationAttemptResult;
import com.Av.Online.Coding.Practice.Platform.dto.AdminCertificationResultsResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationAttempt;
import com.Av.Online.Coding.Practice.Platform.entity.User;

@Service
public class AdminCertificationResultService {

    private final CertificationRepository certificationRepository;

    private final CertificationAttemptRepository
            certificationAttemptRepository;

    public AdminCertificationResultService(
            CertificationRepository certificationRepository,
            CertificationAttemptRepository certificationAttemptRepository) {

        this.certificationRepository =
                certificationRepository;

        this.certificationAttemptRepository =
                certificationAttemptRepository;
    }

    // ============================================================
    // GET CERTIFICATION RESULTS
    // ============================================================

    @Transactional(readOnly = true)
    public AdminCertificationResultsResponse getCertificationResults(
            Long certificationId) {

        Certification certification =
                certificationRepository
                        .findById(certificationId)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Certification not found"
                                )
                        );

        List<CertificationAttempt> attempts =
                certificationAttemptRepository
                        .findByCertificationOrderByStartedAtDesc(
                                certification
                        );

        AdminCertificationResultsResponse response =
                new AdminCertificationResultsResponse();

        response.setCertificationId(
                certification.getId()
        );

        response.setCertificationTitle(
                certification.getTitle()
        );

        response.setTotalAttempts(
                attempts.size()
        );

        // ========================================================
        // SUMMARY COUNTERS
        // ========================================================

        int passedAttempts = 0;
        int failedAttempts = 0;
        int expiredAttempts = 0;
        int inProgressAttempts = 0;

        Set<Long> uniqueUsers =
                new HashSet<>();

        // ========================================================
        // ATTEMPT NUMBERS
        // ========================================================

        /*
         * The repository returns newest attempt first.
         *
         * To calculate:
         *
         * Attempt 1
         * Attempt 2
         * Attempt 3
         *
         * correctly, first count how many attempts each
         * candidate has for this certification.
         */
        Map<Long, Integer> remainingAttemptNumbers =
                new HashMap<>();

        for (CertificationAttempt attempt : attempts) {

            Long userId =
                    attempt
                            .getUser()
                            .getId();

            remainingAttemptNumbers.put(
                    userId,
                    remainingAttemptNumbers
                            .getOrDefault(
                                    userId,
                                    0
                            ) + 1
            );
        }

        List<AdminCertificationAttemptResult> results =
                new ArrayList<>();

        // ========================================================
        // MAP ATTEMPTS
        // ========================================================

        for (CertificationAttempt attempt : attempts) {

            User user =
                    attempt.getUser();

            uniqueUsers.add(
                    user.getId()
            );

            String status =
                    attempt.getStatus();

            // ----------------------------------------------------
            // SUMMARY STATUS
            // ----------------------------------------------------

            if (
                    "TIME_EXPIRED".equalsIgnoreCase(
                            status
                    )
            ) {

                expiredAttempts++;

            } else if (
                    "IN_PROGRESS".equalsIgnoreCase(
                            status
                    )
            ) {

                inProgressAttempts++;

            } else if (
                    "COMPLETED".equalsIgnoreCase(
                            status
                    )
            ) {

                if (
                        Boolean.TRUE.equals(
                                attempt.getPassed()
                        )
                ) {

                    passedAttempts++;

                } else {

                    failedAttempts++;
                }
            }

            // ----------------------------------------------------
            // ATTEMPT NUMBER
            // ----------------------------------------------------

            Integer attemptNumber =
                    remainingAttemptNumbers.get(
                            user.getId()
                    );

            remainingAttemptNumbers.put(
                    user.getId(),
                    attemptNumber - 1
            );

            // ----------------------------------------------------
            // DTO
            // ----------------------------------------------------

            AdminCertificationAttemptResult dto =
                    new AdminCertificationAttemptResult();

            dto.setAttemptId(
                    attempt.getId()
            );

            dto.setUserId(
                    user.getId()
            );

            dto.setCandidateName(
                    user.getName()
            );

            dto.setCandidateEmail(
                    user.getEmail()
            );

            dto.setAttemptNumber(
                    attemptNumber
            );

            dto.setStartedAt(
                    attempt.getStartedAt()
            );

            dto.setSubmittedAt(
                    attempt.getSubmittedAt()
            );

            dto.setTotalQuestions(
                    attempt.getTotalQuestions()
            );

            dto.setCorrectAnswers(
                    attempt.getCorrectAnswers()
            );

            dto.setScore(
                    attempt.getScore()
            );

            dto.setPercentage(
                    attempt.getPercentage()
            );

            dto.setPassed(
                    attempt.getPassed()
            );

            dto.setStatus(
                    attempt.getStatus()
            );

            results.add(
                    dto
            );
        }

        // ========================================================
        // SUMMARY
        // ========================================================

        response.setUniqueCandidates(
                uniqueUsers.size()
        );

        response.setPassedAttempts(
                passedAttempts
        );

        response.setFailedAttempts(
                failedAttempts
        );

        response.setExpiredAttempts(
                expiredAttempts
        );

        response.setInProgressAttempts(
                inProgressAttempts
        );

        response.setAttempts(
                results
        );

        return response;
    }
}