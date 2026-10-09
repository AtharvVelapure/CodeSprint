package com.Av.Online.Coding.Practice.Platform.Repository;


import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateResult;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssessmentCandidateResultRepository
        extends JpaRepository<AssessmentCandidateResult, Long> {

    Optional<AssessmentCandidateResult>
    findBySessionAndAssignmentProblem(
            AssessmentCandidateSession session,
            AssessmentAssignmentProblem assignmentProblem
    );

    List<AssessmentCandidateResult>
    findBySessionOrderByAssignmentProblem_QuestionOrderAsc(
            AssessmentCandidateSession session
    );
}