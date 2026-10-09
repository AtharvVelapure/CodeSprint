package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.CertificateRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.CertificateResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Certificate;
import com.Av.Online.Coding.Practice.Platform.entity.User;

import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
@Transactional
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final UserRepository userRepository;

    private static final DateTimeFormatter DATE_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public CertificateService(
            CertificateRepository certificateRepository,
            UserRepository userRepository) {

        this.certificateRepository = certificateRepository;
        this.userRepository = userRepository;
    }

    // ============================================================
    // GET USER CERTIFICATES
    // ============================================================

    @Transactional(readOnly = true)
    public List<CertificateResponse> getUserCertificates(
            Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        return certificateRepository
                .findByUserOrderByIssuedAtDesc(user)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET ALL CERTIFICATES (ADMIN)
    // ============================================================

    @Transactional(readOnly = true)
    public List<CertificateResponse> getAllCertificates() {
        return certificateRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET CERTIFICATE BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public CertificateResponse getCertificateById(
            Long certificateId) {

        Certificate certificate =
                certificateRepository.findById(certificateId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Certificate not found"));

        return mapToResponse(certificate);
    }

    // ============================================================
    // VERIFY CERTIFICATE
    // ============================================================

    @Transactional(readOnly = true)
    public CertificateResponse verifyCertificate(
            String certificateNumber) {

        Certificate certificate =
                certificateRepository
                        .findByCertificateNumber(
                                certificateNumber)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Invalid certificate number"));

        if (!Boolean.TRUE.equals(
                certificate.getVerified())) {

            throw new ConflictException(
                    "Certificate is not verified");
        }

        return mapToResponse(certificate);
    }

    // ============================================================
    // MAP ENTITY TO RESPONSE
    // ============================================================

    private CertificateResponse mapToResponse(
            Certificate certificate) {

        Long userId = null;
        String userName = null;

        Long certificationId = null;
        String certificationTitle = null;

        Long attemptId = null;

        if (certificate.getUser() != null) {

            userId =
                    certificate.getUser().getId();

            userName =
                    certificate.getUser().getName();
        }

        if (certificate.getCertification() != null) {

            certificationId =
                    certificate.getCertification().getId();

            certificationTitle =
                    certificate.getCertification().getTitle();
        }

        if (certificate.getAttempt() != null) {

            attemptId =
                    certificate.getAttempt().getId();
        }

        String issuedAt = null;

        if (certificate.getIssuedAt() != null) {

            issuedAt =
                    certificate.getIssuedAt()
                            .format(DATE_FORMATTER);
        }

        return new CertificateResponse(
                certificate.getId(),
                certificate.getCertificateNumber(),

                userId,
                userName,

                certificationId,
                certificationTitle,

                attemptId,

                certificate.getCertificateType(),

                certificate.getScore(),
                certificate.getPercentage(),

                issuedAt,

                certificate.getVerified()
        );
    }
}