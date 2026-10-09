package com.Av.Online.Coding.Practice.Platform.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentHostVerificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AssessmentHostVerificationResponse;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostVerification;
import com.Av.Online.Coding.Practice.Platform.entity.User;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class AssessmentHostVerificationService {

    private final AssessmentHostVerificationRepository verificationRepository;
    private final UserRepository userRepository;
    private final AssessmentDocumentStorageService documentStorageService;

    public AssessmentHostVerificationService(
            AssessmentHostVerificationRepository verificationRepository,
            UserRepository userRepository,
            AssessmentDocumentStorageService documentStorageService) {

        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.documentStorageService = documentStorageService;
    }

    // ==========================================
    // USER - SUBMIT VERIFICATION REQUEST
    // ==========================================

    @Transactional
    public AssessmentHostVerificationResponse submitRequest(
            Long userId,
            String businessName,
            String businessEmail,
            MultipartFile document) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        if (businessName == null
                || businessName.trim().isEmpty()) {

            throw new BadRequestException(
                    "Business name is required");
        }

        if (businessEmail == null
                || businessEmail.trim().isEmpty()) {

            throw new BadRequestException(
                    "Business email is required");
        }

        AssessmentHostVerification existing =
                verificationRepository
                        .findFirstByUserOrderByRequestedAtDesc(user)
                        .orElse(null);

        if (existing != null
                && "PENDING".equals(existing.getStatus())) {

            throw new ConflictException(
                    "You already have a pending verification request");
        }

        if (existing != null
                && "APPROVED".equals(existing.getStatus())) {

            throw new ConflictException(
                    "You are already verified to host assessments");
        }

        /*
         * Store the document.
         *
         * The storage service now returns only the generated
         * filename for NEW uploads instead of a machine-specific
         * absolute Windows path.
         */
        String documentPath =
                documentStorageService.storeDocument(document);

        AssessmentHostVerification verification =
                new AssessmentHostVerification();

        verification.setUser(user);
        verification.setBusinessName(businessName.trim());
        verification.setBusinessEmail(businessEmail.trim());
        verification.setDocumentPath(documentPath);
        verification.setStatus("PENDING");
        verification.setRequestedAt(LocalDateTime.now());

        AssessmentHostVerification saved =
                verificationRepository.save(verification);

        return new AssessmentHostVerificationResponse(saved);
    }

    // ==========================================
    // USER - GET LATEST REQUEST
    // ==========================================

    @Transactional
    public AssessmentHostVerificationResponse
            getLatestRequest(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"));

        AssessmentHostVerification verification =
                verificationRepository
                        .findFirstByUserOrderByRequestedAtDesc(user)
                        .orElse(null);

        if (verification == null) {
            return null;
        }

        return new AssessmentHostVerificationResponse(
                verification);
    }

    // ==========================================
    // ADMIN - GET ALL REQUESTS
    // ==========================================

    @Transactional
    public List<AssessmentHostVerificationResponse>
            getAllRequests() {

        return verificationRepository
                .findByOrderByRequestedAtDesc()
                .stream()
                .map(AssessmentHostVerificationResponse::new)
                .toList();
    }

    // ==========================================
    // ADMIN - GET PENDING REQUESTS
    // ==========================================

    @Transactional
    public List<AssessmentHostVerificationResponse>
            getPendingRequests() {

        return verificationRepository
                .findByStatusOrderByRequestedAtDesc("PENDING")
                .stream()
                .map(AssessmentHostVerificationResponse::new)
                .toList();
    }

    // ==========================================
    // ADMIN - APPROVE
    // ==========================================

    @Transactional
    public AssessmentHostVerificationResponse
            approveRequest(
                    Long verificationId,
                    String adminRemarks) {

        AssessmentHostVerification verification =
                verificationRepository.findById(verificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Verification request not found"));

        if ("APPROVED".equals(verification.getStatus())) {

            throw new ConflictException(
                    "Verification request is already approved");
        }

        verification.setStatus("APPROVED");

        verification.setAdminRemarks(
                adminRemarks == null
                        ? null
                        : adminRemarks.trim());

        LocalDateTime now = LocalDateTime.now();

        verification.setReviewedAt(now);
        verification.setVerifiedAt(now);

        AssessmentHostVerification saved =
                verificationRepository.save(verification);

        return new AssessmentHostVerificationResponse(saved);
    }

    // ==========================================
    // ADMIN - REJECT
    // ==========================================

    @Transactional
    public AssessmentHostVerificationResponse
            rejectRequest(
                    Long verificationId,
                    String adminRemarks) {

        AssessmentHostVerification verification =
                verificationRepository.findById(verificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Verification request not found"));

        if ("APPROVED".equals(verification.getStatus())) {

            throw new ConflictException(
                    "Approved verification cannot be rejected");
        }

        if (adminRemarks == null
                || adminRemarks.trim().isEmpty()) {

            throw new BadRequestException(
                    "Admin remarks are required when rejecting");
        }

        verification.setStatus("REJECTED");

        verification.setAdminRemarks(
                adminRemarks.trim());

        verification.setReviewedAt(
                LocalDateTime.now());

        verification.setVerifiedAt(null);

        AssessmentHostVerification saved =
                verificationRepository.save(verification);

        return new AssessmentHostVerificationResponse(saved);
    }

    // ==========================================
    // ADMIN - VIEW DOCUMENT
    // ==========================================

    public Resource getVerificationDocument(
            Long verificationId) {

        AssessmentHostVerification verification =
                verificationRepository.findById(verificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Verification request not found"));

        String documentPath =
                verification.getDocumentPath();

        if (documentPath == null
                || documentPath.isBlank()) {

            throw new ResourceNotFoundException(
                    "Verification document not found");
        }

        try {

            /*
             * IMPORTANT:
             *
             * This uses AssessmentDocumentStorageService instead
             * of directly using Paths.get(documentPath).
             *
             * It supports:
             *
             * 1. New records containing only a filename.
             * 2. Old records containing an absolute Windows path.
             */
            Path path =
                    documentStorageService
                            .resolveDocumentPath(
                                    documentPath);

            if (!Files.exists(path)
                    || !Files.isRegularFile(path)) {

                throw new ResourceNotFoundException(
                        "Verification document does not exist");
            }

            if (!Files.isReadable(path)) {

                throw new ResourceNotFoundException(
                        "Verification document cannot be read");
            }

            Resource resource =
                    new UrlResource(
                            path.toUri());

            if (!resource.exists()
                    || !resource.isReadable()) {

                throw new ResourceNotFoundException(
                        "Verification document cannot be read");
            }

            return resource;

        } catch (ResourceNotFoundException exception) {

            throw exception;

        } catch (Exception exception) {

            throw new IllegalStateException(
                    "Could not read verification document",
                    exception);
        }
    }

    // ==========================================
    // GET DOCUMENT CONTENT TYPE
    // ==========================================

    public String getVerificationDocumentContentType(
            Long verificationId) {

        AssessmentHostVerification verification =
                verificationRepository.findById(verificationId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Verification request not found"));

        String documentPath =
                verification.getDocumentPath();

        if (documentPath == null
                || documentPath.isBlank()) {

            throw new ResourceNotFoundException(
                    "Verification document not found");
        }

        try {

            /*
             * Use the same path-resolution logic as the
             * actual document-reading method.
             */
            Path path =
                    documentStorageService
                            .resolveDocumentPath(
                                    documentPath);

            if (!Files.exists(path)
                    || !Files.isRegularFile(path)) {

                throw new ResourceNotFoundException(
                        "Verification document does not exist");
            }

            String contentType =
                    Files.probeContentType(path);

            if (contentType == null) {

                /*
                 * Fallback based on file extension.
                 * This is useful on Windows where
                 * probeContentType may sometimes return null.
                 */
                String lowerName =
                        path.getFileName()
                                .toString()
                                .toLowerCase();

                if (lowerName.endsWith(".png")) {
                    return "image/png";
                }

                if (lowerName.endsWith(".jpg")
                        || lowerName.endsWith(".jpeg")) {
                    return "image/jpeg";
                }

                if (lowerName.endsWith(".pdf")) {
                    return "application/pdf";
                }

                return "application/octet-stream";
            }

            return contentType;

        } catch (ResourceNotFoundException exception) {

            throw exception;

        } catch (IOException exception) {

            return "application/octet-stream";
        }
    }
}