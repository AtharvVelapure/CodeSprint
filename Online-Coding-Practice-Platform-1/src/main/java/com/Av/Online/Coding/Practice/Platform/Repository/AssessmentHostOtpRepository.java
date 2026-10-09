package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostOtp;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public interface AssessmentHostOtpRepository
        extends JpaRepository<AssessmentHostOtp, Long> {

    Optional<AssessmentHostOtp>
    findFirstByUserAndUsedFalseOrderByCreatedAtDesc(
            User user);
}