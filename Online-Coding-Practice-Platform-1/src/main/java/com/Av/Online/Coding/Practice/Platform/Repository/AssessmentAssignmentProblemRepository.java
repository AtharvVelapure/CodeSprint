package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;

public interface AssessmentAssignmentProblemRepository
        extends JpaRepository<AssessmentAssignmentProblem, Long> {

    /*
     * Get all questions belonging to an assessment
     * in question order.
     */
    List<AssessmentAssignmentProblem>
    findByAssessmentAssignmentOrderByQuestionOrderAsc(
            AssessmentAssignment assessmentAssignment
    );

    /*
     * Check whether a problem is already part of
     * this assessment.
     */
    boolean existsByAssessmentAssignmentAndProblem(
            AssessmentAssignment assessmentAssignment,
            Problem problem
    );

    /*
     * Count questions in an assessment.
     */
    long countByAssessmentAssignment(
            AssessmentAssignment assessmentAssignment
    );

    /*
     * Check whether a problem is being used by
     * any assessment.
     *
     * Problem Management must not delete a problem
     * while it is assigned to an assessment.
     */
    boolean existsByProblem_Id(Long problemId);
}