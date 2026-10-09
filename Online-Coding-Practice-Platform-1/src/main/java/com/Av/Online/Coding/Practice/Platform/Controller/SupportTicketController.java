package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.SupportTicketService;
import com.Av.Online.Coding.Practice.Platform.dto.CreateSupportTicketRequest;
import com.Av.Online.Coding.Practice.Platform.dto.SupportTicketResponse;
import com.Av.Online.Coding.Practice.Platform.dto.UpdateSupportTicketStatusRequest;
import com.Av.Online.Coding.Practice.Platform.security.AuthenticatedUserService;

@RestController
@RequestMapping("/api/support")
public class SupportTicketController {

    private final SupportTicketService
            supportTicketService;
    private final AuthenticatedUserService authenticatedUserService;

    public SupportTicketController(
            SupportTicketService supportTicketService,
            AuthenticatedUserService authenticatedUserService) {

        this.supportTicketService = supportTicketService;
        this.authenticatedUserService = authenticatedUserService;
    }

    @PostMapping("/tickets")
    public ResponseEntity<SupportTicketResponse> createTicket(
            @RequestBody CreateSupportTicketRequest request) {

        request.setUserId(authenticatedUserService.currentUserId());

        return ResponseEntity.ok(
                supportTicketService.createTicket(request)
        );
    }
    
 // =====================================================
 // GET MY SUPPORT TICKETS
 // =====================================================

 @GetMapping("/tickets/user/{userId}")
 public ResponseEntity<?> getUserTickets(
         @PathVariable Long userId) {

         return ResponseEntity.ok(
                 supportTicketService
                         .getUserTickets(userId)
         );
 }
 
//=====================================================
//ADMIN - GET ALL SUPPORT TICKETS
//=====================================================

@GetMapping("/admin/tickets")
public ResponseEntity<?> getAllTickets() {
	
	 return ResponseEntity.ok(
             supportTicketService.getAllTickets()
     );
 }


//=====================================================
//ADMIN - UPDATE SUPPORT TICKET STATUS
//=====================================================

@PutMapping("/admin/tickets/{ticketId}/status")
public ResponseEntity<?> updateTicketStatus(
      @PathVariable Long ticketId,
      @RequestBody
      UpdateSupportTicketStatusRequest request) {

      return ResponseEntity.ok(
              supportTicketService
                      .updateTicketStatus(
                              ticketId,
                              authenticatedUserService.currentUserId(),
                              request.getStatus(),
                              request.getResolutionMessage()
                      )
      );
}
}