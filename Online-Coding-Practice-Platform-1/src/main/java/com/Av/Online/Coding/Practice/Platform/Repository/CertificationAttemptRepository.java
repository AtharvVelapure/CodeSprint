package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationAttempt;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public interface CertificationAttemptRepository
        extends JpaRepository<CertificationAttempt, Long> {

    List<CertificationAttempt>
    findByUserOrderByStartedAtDesc(User user);

    List<CertificationAttempt>
    findByCertificationOrderByStartedAtDesc(
            Certification certification);

    List<CertificationAttempt>
    findByUserAndCertificationOrderByStartedAtDesc(
            User user,
            Certification certification);

    Optional<CertificationAttempt>
    findFirstByUserAndCertificationOrderByStartedAtDesc(
            User user,
            Certification certification);
    
    void deleteByCertification(Certification certification);
}