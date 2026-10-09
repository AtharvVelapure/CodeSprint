package com.Av.Online.Coding.Practice.Platform.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentHostOtpRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentHostVerificationRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostOtp;
import com.Av.Online.Coding.Practice.Platform.entity.AssessmentHostVerification;
import com.Av.Online.Coding.Practice.Platform.entity.User;
import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
public class AssessmentHostOtpService {

    private final AssessmentHostOtpRepository otpRepository;

    private final AssessmentHostVerificationRepository verificationRepository;

    private final UserRepository userRepository;

    private final EmailService emailService;

    private final BCryptPasswordEncoder passwordEncoder =
            new BCryptPasswordEncoder();

    private final SecureRandom secureRandom =
            new SecureRandom();


    public AssessmentHostOtpService(
            AssessmentHostOtpRepository otpRepository,
            AssessmentHostVerificationRepository verificationRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.otpRepository = otpRepository;
        this.verificationRepository = verificationRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
    }


    // =====================================================
    // SEND OTP
    // =====================================================

    @Transactional
    public void sendOtp(Long userId) {

        User user = getUser(userId);

        AssessmentHostVerification verification =
                verificationRepository
                        .findFirstByUserOrderByRequestedAtDesc(user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment host verification not found"
                                )
                        );


        if (!"APPROVED".equalsIgnoreCase(
                verification.getStatus())) {

            throw new ForbiddenException(
                    "You are not approved to host assessments"
            );
        }


        // =================================================
        // OTP ALREADY VERIFIED
        // =================================================

        if (Boolean.TRUE.equals(
                verification.getOtpVerified())) {

            throw new ConflictException(
                    "Your business email is already verified"
            );
        }


        String businessEmail =
                verification.getBusinessEmail();


        if (businessEmail == null
                || businessEmail.trim().isEmpty()) {

            throw new ConflictException(
                    "Verified business email is not available"
            );
        }


        // =================================================
        // GENERATE OTP
        // =================================================

        String otp = generateOtp();


        String otpHash =
                passwordEncoder.encode(otp);


        LocalDateTime expiresAt =
                LocalDateTime.now().plusMinutes(5);


        AssessmentHostOtp otpEntity =
                new AssessmentHostOtp(
                        user,
                        otpHash,
                        expiresAt
                );


        otpRepository.save(otpEntity);


        // =================================================
        // SEND EMAIL
        // =================================================

        emailService.sendAssessmentHostOtp(
                businessEmail,
                otp
        );
    }


    // =====================================================
    // VERIFY OTP
    // =====================================================

    @Transactional
    public boolean verifyOtp(
            Long userId,
            String enteredOtp) {

        if (enteredOtp == null
                || enteredOtp.trim().isEmpty()) {

            throw new BadRequestException(
                    "OTP is required"
            );
        }


        User user = getUser(userId);


        AssessmentHostVerification verification =
                verificationRepository
                        .findFirstByUserOrderByRequestedAtDesc(user)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Assessment host verification not found"
                                )
                        );


        if (!"APPROVED".equalsIgnoreCase(
                verification.getStatus())) {

            throw new ForbiddenException(
                    "Assessment host is not approved"
            );
        }


        // =================================================
        // ALREADY VERIFIED
        // =================================================

        if (Boolean.TRUE.equals(
                verification.getOtpVerified())) {

            return true;
        }


        AssessmentHostOtp otpEntity =
                otpRepository
                        .findFirstByUserAndUsedFalseOrderByCreatedAtDesc(
                                user
                        )
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "OTP not found. Please request a new OTP"
                                )
                        );


        // =================================================
        // CHECK EXPIRY
        // =================================================

        if (LocalDateTime.now()
                .isAfter(otpEntity.getExpiresAt())) {

            throw new ConflictException(
                    "OTP has expired. Please request a new OTP"
            );
        }


        // =================================================
        // CHECK OTP
        // =================================================

        boolean matches =
                passwordEncoder.matches(
                        enteredOtp.trim(),
                        otpEntity.getOtpHash()
                );


        if (!matches) {

            throw new BadRequestException(
                    "Invalid OTP"
            );
        }


        // =================================================
        // MARK OTP AS USED
        // =================================================

        otpEntity.setUsed(true);

        otpRepository.save(otpEntity);


        // =================================================
        // PERMANENTLY MARK BUSINESS EMAIL VERIFIED
        // =================================================

        verification.setOtpVerified(true);

        verificationRepository.save(verification);


        return true;
    }


    // =====================================================
    // GENERATE 6-DIGIT OTP
    // =====================================================

    private String generateOtp() {

        int number =
                secureRandom.nextInt(900000) + 100000;

        return String.valueOf(number);
    }


    // =====================================================
    // GET USER
    // =====================================================

    private User getUser(Long userId) {

        if (userId == null) {

            throw new BadRequestException(
                    "User ID is required"
            );
        }


        return userRepository
                .findById(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "User not found"
                        )
                );
    }
}