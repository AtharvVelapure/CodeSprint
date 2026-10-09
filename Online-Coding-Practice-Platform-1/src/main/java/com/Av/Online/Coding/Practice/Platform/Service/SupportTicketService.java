package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.Year;
import java.util.Locale;
import java.util.List;
import java.time.LocalDateTime;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.SupportTicketRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.dto.CreateSupportTicketRequest;
import com.Av.Online.Coding.Practice.Platform.dto.SupportTicketResponse;
import com.Av.Online.Coding.Practice.Platform.entity.SupportTicket;
import com.Av.Online.Coding.Practice.Platform.entity.SupportTicketCategory;
import com.Av.Online.Coding.Practice.Platform.entity.SupportTicketStatus;
import com.Av.Online.Coding.Practice.Platform.entity.User;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class SupportTicketService {

    private final SupportTicketRepository
            supportTicketRepository;

    private final UserRepository
            userRepository;

    private final EmailService
            emailService;

    public SupportTicketService(
            SupportTicketRepository supportTicketRepository,
            UserRepository userRepository,
            EmailService emailService) {

        this.supportTicketRepository =
                supportTicketRepository;

        this.userRepository =
                userRepository;

        this.emailService =
                emailService;
    }

    @Transactional
    public SupportTicketResponse createTicket(
            CreateSupportTicketRequest request) {

        validateRequest(request);

        User user =
                userRepository
                        .findById(request.getUserId())
                        .orElseThrow(
                                () -> new ResourceNotFoundException("User not found.")
                        );

        SupportTicketCategory category;

        try {

            category =
                    SupportTicketCategory.valueOf(
                            request
                                    .getCategory()
                                    .trim()
                                    .toUpperCase(
                                            Locale.ROOT
                                    )
                    );

        } catch (IllegalArgumentException exception) {

            throw new BadRequestException("Invalid support ticket category.");
        }

        SupportTicket ticket =
                new SupportTicket();

        ticket.setUser(user);

        ticket.setCategory(category);

        ticket.setSubject(
                request.getSubject().trim()
        );

        ticket.setDescription(
                request.getDescription().trim()
        );

        ticket.setStatus(
                SupportTicketStatus.OPEN
        );

        /*
         * First save:
         * MySQL generates the ticket ID.
         */
        ticket =
                supportTicketRepository.saveAndFlush(
                        ticket
                );

        /*
         * Generate ticket number.
         *
         * Example:
         * CS-2026-000002
         */
        String ticketNumber =
                generateTicketNumber(
                        ticket.getId()
                );

        ticket.setTicketNumber(
                ticketNumber
        );

        /*
         * Save ticket number.
         */
        ticket =
                supportTicketRepository.saveAndFlush(
                        ticket
                );

        /*
         * Send confirmation email.
         *
         * IMPORTANT:
         * Email failure must NOT prevent
         * the support ticket from being created.
         */
        try {

            sendTicketCreatedEmail(
                    ticket
            );

        } catch (Exception exception) {

            






        }

        return new SupportTicketResponse(
                ticket
        );
    }
    
 // =====================================================
 // GET USER SUPPORT TICKETS
 // =====================================================

 @Transactional(readOnly = true)
 public List<SupportTicketResponse> getUserTickets(
         Long userId) {

     if (userId == null) {

         throw new BadRequestException("User ID is required.");
     }

     User user =
             userRepository
                     .findById(userId)
                     .orElseThrow(
                             () -> new ResourceNotFoundException("User not found.")
                     );

     return supportTicketRepository
             .findByUserOrderByCreatedAtDesc(user)
             .stream()
             .map(SupportTicketResponse::new)
             .toList();
 }

    // =====================================================
    // GENERATE TICKET NUMBER
    // =====================================================

    private String generateTicketNumber(
            Long ticketId) {

        int year =
                Year.now().getValue();

        return String.format(
                "CS-%d-%06d",
                year,
                ticketId
        );
    }

    // =====================================================
    // SEND TICKET CREATED EMAIL
    // =====================================================

    private void sendTicketCreatedEmail(
            SupportTicket ticket) {

        User user =
                ticket.getUser();

        if (user.getEmail() == null
                || user.getEmail().trim().isEmpty()) {

            throw new IllegalStateException(
                    "User email is not available."
            );
        }

        String userName =
                user.getName() != null
                && !user.getName().trim().isEmpty()
                        ? user.getName()
                        : "User";

        String category =
                formatCategory(
                        ticket.getCategory()
                );

        String subject =
                "Support Ticket Created - "
                + ticket.getTicketNumber();

        String message =
                "Hello "
                + userName
                + ",\n\n"

                + "Your support request has been received successfully.\n\n"

                + "Ticket Details\n"
                + "----------------------------------------\n"
                + "Ticket Number: "
                + ticket.getTicketNumber()
                + "\n"

                + "Category: "
                + category
                + "\n"

                + "Subject: "
                + ticket.getSubject()
                + "\n"

                + "Status: Open\n\n"

                + "Description:\n"
                + ticket.getDescription()
                + "\n\n"

                + "Our support team will review your request.\n"
                + "Please keep your ticket number for future reference.\n\n"

                + "Regards,\n"
                + "CodeSprint Support Team";

        emailService.sendEmail(
                user.getEmail(),
                subject,
                message
        );
    }

    // =====================================================
    // FORMAT CATEGORY
    // =====================================================

    private String formatCategory(
            SupportTicketCategory category) {

        if (category == null) {
            return "";
        }

        String value =
                category.name()
                        .toLowerCase(
                                Locale.ROOT
                        )
                        .replace(
                                "_",
                                " "
                        );

        String[] words =
                value.split(" ");

        StringBuilder formatted =
                new StringBuilder();

        for (String word : words) {

            if (word.isEmpty()) {
                continue;
            }

            if (formatted.length() > 0) {
                formatted.append(" ");
            }

            formatted.append(
                    Character.toUpperCase(
                            word.charAt(0)
                    )
            );

            if (word.length() > 1) {

                formatted.append(
                        word.substring(1)
                );
            }
        }

        return formatted.toString();
    }

    // =====================================================
    // VALIDATION
    // =====================================================

    private void validateRequest(
            CreateSupportTicketRequest request) {

        if (request == null) {

            throw new BadRequestException("Support ticket data is required.");
        }

        if (request.getUserId() == null) {

            throw new BadRequestException("User ID is required.");
        }

        if (request.getCategory() == null
                || request.getCategory()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException("Category is required.");
        }

        if (request.getSubject() == null
                || request.getSubject()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException("Subject is required.");
        }

        if (request.getDescription() == null
                || request.getDescription()
                        .trim()
                        .isEmpty()) {

            throw new BadRequestException("Description is required.");
        }

        if (request.getSubject()
                .trim()
                .length() > 200) {

            throw new BadRequestException("Subject cannot exceed 200 characters.");
        }
    }
    
 // =====================================================
 // ADMIN - GET ALL SUPPORT TICKETS
 // =====================================================

 @Transactional(readOnly = true)
 public List<SupportTicketResponse> getAllTickets() {

     return supportTicketRepository
             .findAllByOrderByCreatedAtDesc()
             .stream()
             .map(SupportTicketResponse::new)
             .toList();
 }


 // =====================================================
 // ADMIN - UPDATE TICKET STATUS
 // =====================================================

 @Transactional
 public SupportTicketResponse updateTicketStatus(
         Long ticketId,
         Long adminUserId,
         String requestedStatus,
         String resolutionMessage) {

     if (ticketId == null) {
         throw new BadRequestException("Ticket ID is required.");
     }

     if (adminUserId == null) {
         throw new BadRequestException("Admin user ID is required.");
     }

     if (requestedStatus == null
             || requestedStatus.trim().isEmpty()) {

         throw new BadRequestException("Status is required.");
     }

     SupportTicket ticket =
             supportTicketRepository
                     .findById(ticketId)
                     .orElseThrow(
                             () -> new ResourceNotFoundException("Support ticket not found.")
                     );

     User admin =
             userRepository
                     .findById(adminUserId)
                     .orElseThrow(
                             () -> new ResourceNotFoundException("Admin user not found.")
                     );

     /*
      * Make sure this user is actually ADMIN.
      */
     if (admin.getRole() == null
             || !admin.getRole()
                     .name()
                     .equals("ADMIN")) {

         throw new ForbiddenException("Only an admin can update support tickets.");
     }

     SupportTicketStatus newStatus;

     try {

         newStatus =
                 SupportTicketStatus.valueOf(
                         requestedStatus
                                 .trim()
                                 .toUpperCase(
                                         Locale.ROOT
                                 )
                 );

     } catch (IllegalArgumentException exception) {

         throw new BadRequestException("Invalid support ticket status.");
     }

     /*
      * A resolved ticket should not be
      * modified again in this first version.
      */
     if (ticket.getStatus()
             == SupportTicketStatus.RESOLVED) {

         throw new ConflictException("This support ticket is already resolved.");
     }

     /*
      * We don't allow moving backwards.
      */
     if (ticket.getStatus()
             == SupportTicketStatus.IN_PROGRESS
             && newStatus
             == SupportTicketStatus.OPEN) {

         throw new ConflictException("Ticket cannot be moved back to OPEN.");
     }

     /*
      * Resolve ticket.
      */
     if (newStatus
             == SupportTicketStatus.RESOLVED) {

         if (resolutionMessage == null
                 || resolutionMessage
                         .trim()
                         .isEmpty()) {

             throw new BadRequestException("Resolution message is required when resolving a ticket.");
         }

         ticket.setStatus(
                 SupportTicketStatus.RESOLVED
         );

         ticket.setResolutionMessage(
                 resolutionMessage.trim()
         );

         ticket.setResolvedAt(
                 LocalDateTime.now()
         );

         ticket.setResolvedBy(
                 admin
         );

         ticket =
                 supportTicketRepository
                         .saveAndFlush(ticket);

         /*
          * Ticket is already saved.
          * Email failure must not delete
          * or undo the support ticket.
          */
         try {

             sendTicketResolvedEmail(
                     ticket
             );

         } catch (Exception exception) {

             






         }

         return new SupportTicketResponse(
                 ticket
         );
     }

     /*
      * OPEN -> IN_PROGRESS
      */
     if (newStatus
             == SupportTicketStatus.IN_PROGRESS) {

         ticket.setStatus(
                 SupportTicketStatus.IN_PROGRESS
         );

         ticket =
                 supportTicketRepository
                         .saveAndFlush(ticket);

         return new SupportTicketResponse(
                 ticket
         );
     }

     /*
      * No need to update OPEN -> OPEN.
      */
     if (newStatus
             == SupportTicketStatus.OPEN) {

         return new SupportTicketResponse(
                 ticket
         );
     }

     throw new ConflictException("Unsupported ticket status change.");
 }


 // =====================================================
 // SEND TICKET RESOLVED EMAIL
 // =====================================================

 private void sendTicketResolvedEmail(
         SupportTicket ticket) {

     User user =
             ticket.getUser();

     if (user.getEmail() == null
             || user.getEmail()
                     .trim()
                     .isEmpty()) {

         throw new IllegalStateException(
                 "User email is not available."
         );
     }

     String userName =
             user.getName() != null
             && !user.getName()
                     .trim()
                     .isEmpty()
                     ? user.getName()
                     : "User";

     String subject =
             "Support Ticket Resolved - "
             + ticket.getTicketNumber();

     String message =
             "Hello "
             + userName
             + ",\n\n"

             + "Your CodeSprint support ticket has been resolved.\n\n"

             + "Ticket Details\n"
             + "----------------------------------------\n"

             + "Ticket Number: "
             + ticket.getTicketNumber()
             + "\n"

             + "Category: "
             + formatCategory(
                     ticket.getCategory()
             )
             + "\n"

             + "Subject: "
             + ticket.getSubject()
             + "\n"

             + "Status: Resolved\n\n"

             + "Resolution:\n"
             + ticket.getResolutionMessage()
             + "\n\n"

             + "Thank you for using CodeSprint.\n\n"

             + "Regards,\n"
             + "CodeSprint Support Team";

     emailService.sendEmail(
             user.getEmail(),
             subject,
             message
     );
 }
}