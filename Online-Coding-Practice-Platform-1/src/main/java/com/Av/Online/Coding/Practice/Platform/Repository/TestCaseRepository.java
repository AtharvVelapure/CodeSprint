package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.TestCase;

public interface TestCaseRepository
        extends JpaRepository<TestCase, Long> {

    List<TestCase> findByProblemId(Long problemId);

    List<TestCase> findByProblemIdAndHiddenFalse(Long problemId);

    /*
     * Delete all test cases belonging to a problem.
     *
     * Used when an unused problem is permanently deleted
     * from Problem Management.
     */
    void deleteByProblem_Id(Long problemId);
}