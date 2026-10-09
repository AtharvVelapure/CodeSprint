package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import com.Av.Online.Coding.Practice.Platform.entity.Contest;
import com.Av.Online.Coding.Practice.Platform.entity.ContestProblem;

public interface ContestProblemRepository extends JpaRepository<ContestProblem, Long> {

    @EntityGraph(attributePaths = {"contest", "problem"})
    List<ContestProblem> findByContestOrderByProblemOrderAsc(Contest contest);

    void deleteByContest(Contest contest);

/*
 * Check whether a problem is currently used
 * by any contest.
 *
 * Problem Management must not delete a problem
 * while it belongs to a contest.
 */
boolean existsByProblem_Id(Long problemId);
}