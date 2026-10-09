package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.SupportTicket;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public interface SupportTicketRepository
        extends JpaRepository<SupportTicket, Long> {

    Optional<SupportTicket> findByTicketNumber(
            String ticketNumber
    );

    boolean existsByTicketNumber(
            String ticketNumber
    );

    List<SupportTicket>
    findByUserOrderByCreatedAtDesc(
            User user
    );
    
    List<SupportTicket> findAllByOrderByCreatedAtDesc();
}