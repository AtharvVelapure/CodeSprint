package com.Av.Online.Coding.Practice.Platform.Repository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateAnswer;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssessmentCandidateAnswerRepository
        extends JpaRepository<AssessmentCandidateAnswer, Long> {

    Optional<AssessmentCandidateAnswer>
    findBySessionAndAssignmentProblem(
            AssessmentCandidateSession session,
            AssessmentAssignmentProblem assignmentProblem
    );

    List<AssessmentCandidateAnswer>
    findBySessionOrderByAssignmentProblem_QuestionOrderAsc(
            AssessmentCandidateSession session
    );
}