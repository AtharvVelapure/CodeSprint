package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.ProblemEditorial;

public interface ProblemEditorialRepository
        extends JpaRepository<ProblemEditorial, Long> {

    Optional<ProblemEditorial> findByProblemId(Long problemId);

    /*
     * Delete the editorial belonging to a problem.
     *
     * Used when an unused problem is permanently
     * deleted from Problem Management.
     */
    void deleteByProblem_Id(Long problemId);
}