package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.CertificateRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationAttemptRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationQuestionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationRepository;
import com.Av.Online.Coding.Practice.Platform.dto.CertificationResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
@Transactional
public class AdminCertificationService {

    private final CertificationRepository certificationRepository;
    private final CertificationQuestionRepository questionRepository;
    private final CertificationAttemptRepository attemptRepository;
    private final CertificateRepository certificateRepository;

    public AdminCertificationService(
            CertificationRepository certificationRepository,
            CertificationQuestionRepository questionRepository,
            CertificationAttemptRepository attemptRepository,
            CertificateRepository certificateRepository) {

        this.certificationRepository = certificationRepository;
        this.questionRepository = questionRepository;
        this.attemptRepository = attemptRepository;
        this.certificateRepository = certificateRepository;
    }

    // ============================================================
    // CREATE CERTIFICATION
    // ============================================================

    public CertificationResponse createCertification(
            Certification certification) {

        validateCertification(certification);

        /*
         * New certifications are created as DRAFT when the
         * admin does not provide a status.
         */
        if (certification.getStatus() == null
                || certification.getStatus().trim().isEmpty()) {

            certification.setStatus("DRAFT");
        }

        /*
         * Default retake configuration.
         *
         * If admin does not provide allowRetake,
         * retake is disabled.
         */
        if (certification.getAllowRetake() == null) {
            certification.setAllowRetake(false);
        }

        /*
         * If retake is disabled, maxAttempts is always 1.
         */
        if (!certification.getAllowRetake()) {
            certification.setMaxAttempts(1);
        }

        Certification savedCertification =
                certificationRepository.save(certification);

        return mapToResponse(savedCertification);
    }

    // ============================================================
    // GET ALL CERTIFICATIONS
    // ============================================================

    @Transactional(readOnly = true)
    public List<CertificationResponse> getAllCertifications() {

        return certificationRepository
                .findAllByOrderByTitleAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ============================================================
    // GET CERTIFICATION BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public CertificationResponse getCertificationById(
            Long certificationId) {

        Certification certification =
                findCertification(certificationId);

        return mapToResponse(certification);
    }

    // ============================================================
    // UPDATE CERTIFICATION
    // ============================================================

    public CertificationResponse updateCertification(
            Long certificationId,
            Certification updatedCertification) {

        Certification existingCertification =
                findCertification(certificationId);

        validateCertification(updatedCertification);

        /*
         * Check how many questions are already assigned.
         */
        List<?> existingQuestions =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                existingCertification
                        );

        int assignedQuestionCount =
                existingQuestions.size();

        /*
         * The certification cannot have fewer total questions
         * than the questions already assigned to it.
         */
        if (updatedCertification.getTotalQuestions()
                < assignedQuestionCount) {

            throw new ConflictException(
                    "Total questions cannot be less than the "
                    + assignedQuestionCount
                    + " questions already assigned."
            );
        }

        existingCertification.setTitle(
                updatedCertification.getTitle().trim()
        );

        existingCertification.setDescription(
                updatedCertification.getDescription().trim()
        );

        existingCertification.setCategory(
                updatedCertification.getCategory().trim()
        );

        existingCertification.setDifficulty(
                updatedCertification.getDifficulty().trim()
        );

        existingCertification.setDurationMinutes(
                updatedCertification.getDurationMinutes()
        );

        existingCertification.setTotalQuestions(
                updatedCertification.getTotalQuestions()
        );

        existingCertification.setPassingPercentage(
                updatedCertification.getPassingPercentage()
        );

        /*
         * Update retake configuration.
         */
        Boolean allowRetake =
                updatedCertification.getAllowRetake();

        if (allowRetake == null) {
            allowRetake = false;
        }

        existingCertification.setAllowRetake(allowRetake);

        /*
         * If retakes are disabled, only one attempt is allowed.
         */
        if (!allowRetake) {

            existingCertification.setMaxAttempts(1);

        } else {

            existingCertification.setMaxAttempts(
                    updatedCertification.getMaxAttempts()
            );
        }

        /*
         * Only update status when the admin actually sends one.
         */
        if (updatedCertification.getStatus() != null
                && !updatedCertification.getStatus()
                        .trim()
                        .isEmpty()) {

            existingCertification.setStatus(
                    updatedCertification.getStatus().trim()
            );
        }

        Certification savedCertification =
                certificationRepository.save(
                        existingCertification
                );

        return mapToResponse(savedCertification);
    }

    // ============================================================
    // ACTIVATE CERTIFICATION
    // ============================================================

    public CertificationResponse activateCertification(
            Long certificationId) {

        Certification certification =
                findCertification(certificationId);

        /*
         * Before activating, make sure the required number of
         * coding questions has actually been assigned.
         */
        List<?> questions =
                questionRepository
                        .findByCertificationOrderByQuestionOrderAsc(
                                certification
                        );

        int assignedQuestionCount =
                questions.size();

        if (assignedQuestionCount
                != certification.getTotalQuestions()) {

            throw new ConflictException(
                    "Certification cannot be activated. "
                    + "It requires "
                    + certification.getTotalQuestions()
                    + " questions, but "
                    + assignedQuestionCount
                    + " questions are currently assigned."
            );
        }

        certification.setStatus("ACTIVE");

        Certification savedCertification =
                certificationRepository.save(
                        certification
                );

        return mapToResponse(savedCertification);
    }

    // ============================================================
    // DEACTIVATE CERTIFICATION
    // ============================================================

    public CertificationResponse deactivateCertification(
            Long certificationId) {

        Certification certification =
                findCertification(certificationId);

        certification.setStatus("INACTIVE");

        Certification savedCertification =
                certificationRepository.save(
                        certification
                );

        return mapToResponse(savedCertification);
    }

    // ============================================================
    // DELETE CERTIFICATION
    // ============================================================

    public void deleteCertification(
            Long certificationId) {

        Certification certification =
                findCertification(certificationId);

        /*
         * Delete dependent records first.
         */

        // 1. Delete certificates
        certificateRepository.deleteByCertification(
                certification
        );

        // 2. Delete certification attempts
        attemptRepository.deleteByCertification(
                certification
        );

        // 3. Delete certification questions
        questionRepository.deleteByCertification(
                certification
        );

        // 4. Finally delete certification
        certificationRepository.delete(
                certification
        );
    }

    // ============================================================
    // FIND CERTIFICATION
    // ============================================================

    private Certification findCertification(
            Long certificationId) {

        return certificationRepository
                .findById(certificationId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Certification not found"
                        )
                );
    }

    // ============================================================
    // VALIDATE CERTIFICATION
    // ============================================================

    private void validateCertification(
            Certification certification) {

        if (certification == null) {
            throw new BadRequestException(
                    "Certification data is required"
            );
        }

        if (certification.getTitle() == null
                || certification.getTitle()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException(
                    "Certification title is required"
            );
        }

        if (certification.getDescription() == null
                || certification.getDescription()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException(
                    "Certification description is required"
            );
        }

        if (certification.getCategory() == null
                || certification.getCategory()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException(
                    "Certification category is required"
            );
        }

        if (certification.getDifficulty() == null
                || certification.getDifficulty()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException(
                    "Certification difficulty is required"
            );
        }

        if (certification.getDurationMinutes() == null
                || certification.getDurationMinutes() <= 0) {

            throw new BadRequestException(
                    "Duration must be greater than zero"
            );
        }

        if (certification.getTotalQuestions() == null
                || certification.getTotalQuestions() <= 0) {

            throw new BadRequestException(
                    "Total questions must be greater than zero"
            );
        }

        if (certification.getPassingPercentage() == null
                || certification.getPassingPercentage() <= 0
                || certification.getPassingPercentage() > 100) {

            throw new BadRequestException(
                    "Passing percentage must be between 1 and 100"
            );
        }

        /*
         * Retake validation.
         */
        if (certification.getAllowRetake() != null
                && certification.getAllowRetake()) {

            if (certification.getMaxAttempts() == null
                    || certification.getMaxAttempts() <= 1) {

                throw new BadRequestException(
                        "Maximum attempts must be greater than 1 "
                        + "when retakes are allowed"
                );
            }
        }
    }

    // ============================================================
    // ENTITY -> DTO
    // ============================================================

    private CertificationResponse mapToResponse(
            Certification certification) {

        return new CertificationResponse(
                certification.getId(),
                certification.getTitle(),
                certification.getDescription(),
                certification.getCategory(),
                certification.getDifficulty(),
                certification.getDurationMinutes(),
                certification.getTotalQuestions(),
                certification.getPassingPercentage(),
                certification.getStatus(),
                certification.getAllowRetake(),
                certification.getMaxAttempts()
        );
    }
}