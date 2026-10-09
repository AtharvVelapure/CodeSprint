package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.Av.Online.Coding.Practice.Platform.entity.Problem;

public interface ProblemRepository
        extends JpaRepository<Problem, Long> {

    // ============================================================
    // SOURCE
    // ============================================================

    List<Problem> findBySource(String source);


    // ============================================================
    // SOURCE + CATEGORY
    // ============================================================

    List<Problem> findBySourceAndCategory(
            String source,
            String category
    );


    // ============================================================
    // SOURCE + DIFFICULTY
    // ============================================================

    List<Problem> findBySourceAndDifficulty(
            String source,
            String difficulty
    );


    // ============================================================
    // ACTIVE NORMAL PROBLEMS
    // ============================================================

    List<Problem> findBySourceAndActive(
            String source,
            boolean active
    );


    // ============================================================
    // ACTIVE NORMAL PROBLEMS BY CATEGORY
    // ============================================================

    List<Problem> findBySourceAndCategoryAndActive(
            String source,
            String category,
            boolean active
    );


    // ============================================================
    // ACTIVE NORMAL PROBLEMS BY DIFFICULTY
    // ============================================================

    List<Problem> findBySourceAndDifficultyAndActive(
            String source,
            String difficulty,
            boolean active
    );


    // ============================================================
    // CATEGORY
    // ============================================================

    List<Problem> findByCategory(String category);


    // ============================================================
    // DIFFICULTY
    // ============================================================

    List<Problem> findByDifficulty(String difficulty);


    // ============================================================
    // DIFFICULTY COUNT
    // ============================================================

    long countByDifficultyIgnoreCase(String difficulty);


    // ============================================================
    // DISTINCT CATEGORIES
    // ============================================================

    @Query("""
        SELECT DISTINCT p.category
        FROM Problem p
        WHERE p.category IS NOT NULL
    """)
    List<String> findDistinctCategories();


    // ============================================================
    // DISTINCT DIFFICULTIES
    // ============================================================

    @Query("""
        SELECT DISTINCT p.difficulty
        FROM Problem p
        WHERE p.difficulty IS NOT NULL
    """)
    List<String> findDistinctDifficulties();
}