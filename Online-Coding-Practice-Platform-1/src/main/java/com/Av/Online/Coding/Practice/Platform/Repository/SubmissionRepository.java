package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Av.Online.Coding.Practice.Platform.entity.Submission;

public interface SubmissionRepository
        extends JpaRepository<Submission, Long> {

    // ============================================================
    // USER SUBMISSIONS
    // ============================================================

    // Get all submissions of a user
    List<Submission> findByUserIdOrderBySubmittedAtDesc(
            Long userId
    );

    // Get submissions of a user for a specific problem
    List<Submission> findByUserIdAndProblemIdOrderBySubmittedAtDesc(
            Long userId,
            Long problemId
    );


    // ============================================================
    // PROBLEM USAGE CHECK
    // ============================================================

    /*
     * Check whether any submission exists for a problem.
     *
     * Problem Management must not delete a problem
     * when submission history exists for it.
     */
    boolean existsByProblemId(Long problemId);


    // ============================================================
    // SUBMISSION COUNTS
    // ============================================================

    // Count unsuccessful submissions for a user and problem
    long countByUserIdAndProblemIdAndStatusIn(
            Long userId,
            Long problemId,
            List<String> statuses
    );


    // ============================================================
    // CONTEST SUBMISSIONS
    // ============================================================

    List<Submission> findByContestIdOrderBySubmittedAtDesc(
            Long contestId
    );

    List<Submission> findByContestIdAndUserIdOrderBySubmittedAtDesc(
            Long contestId,
            Long userId
    );


    // ============================================================
    // USER STATISTICS
    // ============================================================

    // Count distinct problems successfully solved by a user
    @Query("""
        SELECT COUNT(DISTINCT s.problemId)
        FROM Submission s
        WHERE s.userId = :userId
        AND LOWER(s.status) = 'accepted'
    """)
    long countSolvedProblemsByUserId(
            @Param("userId") Long userId
    );

    // Count total submissions made by a user
    long countByUserId(Long userId);

    // Count distinct problems attempted by a user
    @Query("""
        SELECT COUNT(DISTINCT s.problemId)
        FROM Submission s
        WHERE s.userId = :userId
    """)
    long countAttemptedProblemsByUserId(
            @Param("userId") Long userId
    );

    List<Submission> findTop5ByUserIdOrderBySubmittedAtDesc(
            Long userId
    );

    Submission findFirstByUserIdOrderBySubmittedAtDesc(
            Long userId
    );


    // ============================================================
    // ACCEPTED SUBMISSION STATISTICS
    // ============================================================

    @Query("""
        SELECT COUNT(s)
        FROM Submission s
        WHERE s.userId = :userId
        AND LOWER(s.status) = 'accepted'
    """)
    long countAcceptedSubmissionsByUserId(
            @Param("userId") Long userId
    );

    @Query("""
        SELECT COUNT(s)
        FROM Submission s
        WHERE LOWER(s.status) = 'accepted'
    """)
    long countAcceptedSubmissions();

    @Query("""
        SELECT COUNT(s)
        FROM Submission s
        WHERE LOWER(s.status) = 'accepted'
    """)
    long countAcceptedSubmissionsPlatform();
}