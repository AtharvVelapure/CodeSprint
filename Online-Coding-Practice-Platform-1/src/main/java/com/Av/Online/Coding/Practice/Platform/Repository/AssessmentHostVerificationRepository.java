package com.Av.Online.Coding.Practice.Platform.Repository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostVerification;
import com.Av.Online.Coding.Practice.Platform.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AssessmentHostVerificationRepository
        extends JpaRepository<AssessmentHostVerification, Long> {

    List<AssessmentHostVerification>
            findByOrderByRequestedAtDesc();

    List<AssessmentHostVerification>
            findByStatusOrderByRequestedAtDesc(String status);

    List<AssessmentHostVerification>
            findByUserOrderByRequestedAtDesc(User user);

    Optional<AssessmentHostVerification>
            findFirstByUserOrderByRequestedAtDesc(User user);

    Optional<AssessmentHostVerification>
            findFirstByUserAndStatus(
                    User user,
                    String status);
}
