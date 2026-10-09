package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateFeedback;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;

public interface AssessmentCandidateFeedbackRepository
        extends JpaRepository<AssessmentCandidateFeedback, Long> {

    Optional<AssessmentCandidateFeedback> findBySession(
            AssessmentCandidateSession session
    );

    boolean existsBySession(
            AssessmentCandidateSession session
    );

    /*
     * Get all candidate feedback belonging to
     * one assessment.
     *
     * Feedback
     *   -> Session
     *   -> Invitation
     *   -> Assessment
     */
    List<AssessmentCandidateFeedback>
    findBySession_Invitation_AssessmentOrderBySubmittedAtDesc(
            AssessmentAssignment assessment
    );
}