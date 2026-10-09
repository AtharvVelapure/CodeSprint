package com.Av.Online.Coding.Practice.Platform.Repository;


import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignmentProblem;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSubmission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentCandidateSubmissionRepository
        extends JpaRepository<AssessmentCandidateSubmission, Long> {

    List<AssessmentCandidateSubmission>
    findBySessionOrderBySubmittedAtAsc(
            AssessmentCandidateSession session
    );

    List<AssessmentCandidateSubmission>
    findBySessionAndAssignmentProblemOrderBySubmittedAtDesc(
            AssessmentCandidateSession session,
            AssessmentAssignmentProblem assignmentProblem
    );
}