package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentInvitation;

public interface AssessmentCandidateSessionRepository
        extends JpaRepository<AssessmentCandidateSession, Long> {

    Optional<AssessmentCandidateSession>
    findByInvitation(AssessmentInvitation invitation);
}