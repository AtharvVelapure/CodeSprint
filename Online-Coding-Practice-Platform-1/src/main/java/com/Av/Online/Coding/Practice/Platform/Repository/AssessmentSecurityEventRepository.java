package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentCandidateSession;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentSecurityEvent;

@Repository
public interface AssessmentSecurityEventRepository
        extends JpaRepository<AssessmentSecurityEvent, Long> {

    List<AssessmentSecurityEvent>
            findBySessionOrderByOccurredAtAsc(
                    AssessmentCandidateSession session
            );

    long countBySessionAndWarningIssuedTrue(
            AssessmentCandidateSession session
    );
}