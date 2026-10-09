package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.Certificate;
import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationAttempt;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public interface CertificateRepository
        extends JpaRepository<Certificate, Long> {

    // Get all certificates of a user
    List<Certificate> findByUserOrderByIssuedAtDesc(
            User user
    );

    // Get certificates for a particular certification
    List<Certificate> findByCertificationOrderByIssuedAtDesc(
            Certification certification
    );

    // Find certificate earned from a particular attempt
    Optional<Certificate> findByAttempt(
            CertificationAttempt attempt
    );

    // Check whether a particular attempt earned a certificate
    boolean existsByAttempt(
            CertificationAttempt attempt
    );

    // Find the certificate earned by a user for a certification
    Optional<Certificate> findByUserAndCertification(
            User user,
            Certification certification
    );

    // Check whether the user is already certified
    boolean existsByUserAndCertification(
            User user,
            Certification certification
    );

    // Find certificate using public certificate number
    Optional<Certificate> findByCertificateNumber(
            String certificateNumber
    );

    // Check certificate number uniqueness
    boolean existsByCertificateNumber(
            String certificateNumber
    );

    void deleteByCertification(
            Certification certification
    );
}