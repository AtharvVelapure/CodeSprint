package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentAssignment;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public interface AssessmentAssignmentRepository
        extends JpaRepository<AssessmentAssignment, Long> {

    List<AssessmentAssignment>
    findByCreatedByOrderByCreatedAtDesc(User createdBy);

    List<AssessmentAssignment>
    findByStatusOrderByCreatedAtDesc(String status);

    List<AssessmentAssignment>
    findByCreatedByAndStatusOrderByCreatedAtDesc(
            User createdBy,
            String status);
    
    Optional<AssessmentAssignment> findByPublicToken(String publicToken);
    long countByDeletedFalse();

}