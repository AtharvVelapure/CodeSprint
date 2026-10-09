package com.Av.Online.Coding.Practice.Platform.Service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    // =====================================================
    // SEND SIMPLE EMAIL
    // =====================================================

    public void sendEmail(
            String recipient,
            String subject,
            String message) {

        if (recipient == null
                || recipient.trim().isEmpty()) {

            throw new BadRequestException(
                    "Recipient email is required"
            );
        }

        SimpleMailMessage mail =
                new SimpleMailMessage();

        mail.setFrom(senderEmail);
        mail.setTo(recipient.trim());
        mail.setSubject(subject);
        mail.setText(message);

        mailSender.send(mail);
    }

    // =====================================================
    // SEND ASSESSMENT HOST OTP
    // =====================================================

    public void sendAssessmentHostOtp(
            String recipient,
            String otp) {

        String subject =
                "CodeSprint Assessment Host Verification OTP";

        String message =
                "Hello,\n\n"
                + "Your CodeSprint OTP for creating a coding "
                + "assessment is:\n\n"
                + otp
                + "\n\n"
                + "This OTP is valid for 5 minutes.\n"
                + "Do not share this OTP with anyone.\n\n"
                + "If you did not request this OTP, "
                + "please ignore this email.\n\n"
                + "Regards,\n"
                + "CodeSprint Team";

        sendEmail(
                recipient,
                subject,
                message
        );
    }

    // =====================================================
    // SEND ASSESSMENT INVITATION
    // =====================================================

    public void sendAssessmentInvitation(
            String recipient,
            String candidateName,
            String companyName,
            String position,
            Integer durationMinutes,
            String assessmentLink) {

        String displayName =
                candidateName != null
                && !candidateName.trim().isEmpty()
                        ? candidateName
                        : "Candidate";

        String subject =
                "CodeSprint Coding Assessment Invitation";

        String message =
                "Hello " + displayName + ",\n\n"
                + "You have been invited to complete a coding assessment.\n\n"
                + "Company: " + companyName + "\n"
                + "Position: " + position + "\n"
                + "Duration: " + durationMinutes + " minutes\n\n"
                + "Assessment Link:\n"
                + assessmentLink + "\n\n"
                + "You do not need a CodeSprint account to take this assessment.\n\n"
                + "Please open the assessment link and follow the instructions provided.\n\n"
                + "Regards,\n"
                + "CodeSprint Team";

        sendEmail(
                recipient,
                subject,
                message
        );
    }

    // =====================================================
    // SEND CONTEST INVITATION
    // =====================================================

    public void sendContestInvitation(
            String recipient,
            String userName,
            String contestTitle,
            String startTime,
            Integer durationMinutes,
            String registrationDeadline,
            String registrationLink) {

        String displayName =
                userName != null
                && !userName.trim().isEmpty()
                        ? userName
                        : "User";

        String subject =
                "CodeSprint Contest Invitation - "
                + contestTitle;

        String message =
                "Hello " + displayName + ",\n\n"
                + "A new coding contest is now open for registration on CodeSprint.\n\n"
                + "Contest: " + contestTitle + "\n"
                + "Start Time: " + startTime + "\n"
                + "Duration: " + durationMinutes + " minutes\n"
                + "Registration Deadline: " + registrationDeadline + "\n\n"
                + "Register for the contest using the link below:\n"
                + registrationLink + "\n\n"
                + "Opening this link does not automatically register you.\n"
                + "Please sign in to CodeSprint and click Register Now to confirm your registration.\n\n"
                + "Regards,\n"
                + "CodeSprint Team";

        sendEmail(
                recipient,
                subject,
                message
        );
    }

    // =====================================================
    // SEND CONTEST REGISTRATION CONFIRMATION
    // =====================================================

    public void sendContestRegistrationConfirmation(
            String recipient,
            String userName,
            String contestTitle,
            String startTime,
            Integer durationMinutes) {

        String displayName =
                userName != null
                && !userName.trim().isEmpty()
                        ? userName
                        : "User";

        String subject =
                "Contest Registration Confirmed - "
                + contestTitle;

        String message =
                "Hello " + displayName + ",\n\n"
                + "Your registration for the following CodeSprint contest "
                + "has been confirmed.\n\n"
                + "Contest: " + contestTitle + "\n"
                + "Start Time: " + startTime + "\n"
                + "Duration: " + durationMinutes + " minutes\n\n"
                + "Please sign in to CodeSprint before the contest starts.\n"
                + "You will be able to enter the contest once it becomes LIVE.\n\n"
                + "Good luck!\n\n"
                + "Regards,\n"
                + "CodeSprint Team";

        sendEmail(
                recipient,
                subject,
                message
        );
    }

    // =====================================================
    // SEND CONTEST SCHEDULE UPDATE
    // =====================================================

    public void sendContestScheduleUpdate(
            String recipient,
            String userName,
            String contestTitle,
            String registrationStartTime,
            String registrationDeadline,
            String contestStartTime,
            Integer durationMinutes) {

        String displayName =
                userName != null
                && !userName.trim().isEmpty()
                        ? userName
                        : "User";

        String subject =
                "CodeSprint Contest Schedule Updated - "
                + contestTitle;

        String message =
                "Hello " + displayName + ",\n\n"
                + "The schedule for the following CodeSprint contest "
                + "has been updated.\n\n"
                + "Contest: " + contestTitle + "\n"
                + "Registration Opens: "
                + (registrationStartTime != null
                        ? registrationStartTime
                        : "Not specified")
                + "\n"
                + "Registration Deadline: "
                + (registrationDeadline != null
                        ? registrationDeadline
                        : "Not specified")
                + "\n"
                + "Contest Starts: "
                + (contestStartTime != null
                        ? contestStartTime
                        : "Not specified")
                + "\n"
                + "Duration: "
                + durationMinutes
                + " minutes\n\n"
                + "Please note the updated schedule and make sure "
                + "you register before the new registration deadline.\n\n"
                + "Regards,\n"
                + "CodeSprint Team";

        sendEmail(
                recipient,
                subject,
                message
        );
    }
}