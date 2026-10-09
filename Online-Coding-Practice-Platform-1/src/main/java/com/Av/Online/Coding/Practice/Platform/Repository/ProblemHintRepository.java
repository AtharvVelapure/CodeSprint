package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.ProblemHint;

public interface ProblemHintRepository
        extends JpaRepository<ProblemHint, Long> {

    List<ProblemHint> findByProblemIdOrderByHintOrderAsc(
            Long problemId
    );

    /*
     * Delete all hints belonging to a problem.
     *
     * Used when an unused problem is permanently
     * deleted from Problem Management.
     */
    void deleteByProblem_Id(Long problemId);
}