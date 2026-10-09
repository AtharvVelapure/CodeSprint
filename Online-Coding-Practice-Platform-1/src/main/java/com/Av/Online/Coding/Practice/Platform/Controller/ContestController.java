package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.ContestService;
import com.Av.Online.Coding.Practice.Platform.dto.ContestParticipantResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ContestResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Contest;
import com.Av.Online.Coding.Practice.Platform.entity.ContestParticipant;
import com.Av.Online.Coding.Practice.Platform.dto.ContestProblemResponse;
import com.Av.Online.Coding.Practice.Platform.entity.ContestStatus;
import com.Av.Online.Coding.Practice.Platform.dto.ContestRegistrationResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ContestRegisterResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ContestStartResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ContestPlayProblemResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ContestLeaderboardResponse;

@RestController
@RequestMapping("/api/contests")
public class ContestController {

    private final ContestService contestService;

    public ContestController(ContestService contestService) {
        this.contestService = contestService;
    }


    // =========================
    // GET ALL CONTESTS
    // =========================

    @GetMapping
    public ResponseEntity<List<ContestResponse>> getAllContests() {

        List<Contest> contests =
                contestService.getAllContests();

        List<ContestResponse> responses =
                contests.stream()
                        .map(contestService::toContestResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }


    // =========================
    // GET CONTEST BY ID
    // =========================

    @GetMapping("/{id}")
    public ResponseEntity<ContestResponse> getContestById(
            @PathVariable Long id) {

        Contest contest =
                contestService.getContestById(id);

        return ResponseEntity.ok(
                contestService.toContestResponse(contest)
        );
    }


    // =========================
    // GET CONTESTS BY STATUS
    // =========================

    @GetMapping("/status/{status}")
    public ResponseEntity<List<ContestResponse>> getContestsByStatus(
            @PathVariable ContestStatus status) {

        List<Contest> contests =
                contestService.getContestsByStatus(status);

        List<ContestResponse> responses =
                contests.stream()
                        .map(contestService::toContestResponse)
                        .collect(Collectors.toList());

        return ResponseEntity.ok(responses);
    }


    // =========================
    // CREATE CONTEST
    // =========================

    @PostMapping
    public ResponseEntity<ContestResponse> createContest(
            @RequestBody Contest contest,
            @RequestParam Long createdByUserId) {

        Contest createdContest =
                contestService.createContest(
                        contest,
                        createdByUserId
                );

        return ResponseEntity.ok(
                contestService.toContestResponse(
                        createdContest
                )
        );
    }


    // =========================
    // UPDATE CONTEST
    // =========================

    @PutMapping("/{id}")
    public ResponseEntity<ContestResponse> updateContest(
            @PathVariable Long id,
            @RequestBody Contest contest) {

        Contest updatedContest =
                contestService.updateContest(
                        id,
                        contest
                );

        return ResponseEntity.ok(
                contestService.toContestResponse(
                        updatedContest
                )
        );
    }


    // =========================
    // PUBLISH CONTEST
    // =========================

    @PostMapping("/{id}/publish")
    public ResponseEntity<ContestResponse> publishContest(
            @PathVariable Long id) {

        Contest publishedContest =
                contestService.publishContest(id);

        return ResponseEntity.ok(
                contestService.toContestResponse(
                        publishedContest
                )
        );
    }
    
 // =========================
 // CANCEL CONTEST
 // =========================

 @PostMapping("/{id}/cancel")
 public ResponseEntity<ContestResponse> cancelContest(
         @PathVariable Long id) {

     Contest cancelledContest =
             contestService.cancelContest(id);

     return ResponseEntity.ok(
             contestService.toContestResponse(
                     cancelledContest
             )
     );
 }

//=========================
//END CONTEST
//=========================

@PostMapping("/{id}/end")
public ResponseEntity<ContestResponse> endContest(
      @PathVariable Long id) {

  Contest finishedContest =
          contestService.endContest(id);

  return ResponseEntity.ok(
          contestService.toContestResponse(
                  finishedContest
          )
  );
}

    // =========================
    // DELETE CONTEST
    // =========================

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteContest(
            @PathVariable Long id) {

        contestService.deleteContest(id);

        return ResponseEntity
                .noContent()
                .build();
    }


    // =========================
    // ADD PROBLEM TO CONTEST
    // =========================

    @PostMapping("/{contestId}/problems")
    public ResponseEntity<ContestProblemResponse> addProblemToContest(
            @PathVariable Long contestId,
            @RequestParam Long problemId,
            @RequestParam Integer problemOrder,
            @RequestParam Integer points) {

        ContestProblemResponse contestProblem =
                contestService.addProblemToContest(
                        contestId,
                        problemId,
                        problemOrder,
                        points
                );

        return ResponseEntity.ok(
                contestProblem
        );
    }


    // =========================
    // GET CONTEST PROBLEMS
    // =========================

    @GetMapping("/{contestId}/problems")
    public ResponseEntity<List<ContestProblemResponse>> getContestProblems(
            @PathVariable Long contestId) {

        return ResponseEntity.ok(
                contestService.getContestProblems(
                        contestId
                )
        );
    }
    
 // ==============================
 // GET PROTECTED PLAY PROBLEMS
 // ==============================

 @GetMapping("/{contestId}/play/problems")
 public ResponseEntity<List<ContestPlayProblemResponse>> getContestPlayProblems(
         @PathVariable Long contestId,
         @RequestParam Long userId) {

     return ResponseEntity.ok(
             contestService.getContestPlayProblems(
                     contestId,
                     userId
             )
     );
 }


    // =========================
    // REMOVE PROBLEM
    // =========================

    @DeleteMapping("/problems/{contestProblemId}")
    public ResponseEntity<Void> removeProblemFromContest(
            @PathVariable Long contestProblemId) {

        contestService.removeProblemFromContest(
                contestProblemId
        );

        return ResponseEntity
                .noContent()
                .build();
    }


    // =========================
    // REGISTER USER
    // =========================

    @PostMapping("/{contestId}/register")
    public ResponseEntity<ContestRegisterResponse> registerUser(
            @PathVariable Long contestId,
            @RequestParam Long userId) {

        ContestParticipant participant =
                contestService.registerUser(
                        contestId,
                        userId
                );

        ContestRegisterResponse response =
                new ContestRegisterResponse(
                        participant.getId(),
                        participant.getContest().getId(),
                        participant.getUser().getId(),
                        true,
                        participant.getRegisteredAt(),
                        "Registration successful"
                );

        return ResponseEntity.ok(response);
    }

    // =========================
    // CHECK REGISTRATION
    // =========================

    @GetMapping("/{contestId}/registered/{userId}")
    public ResponseEntity<Boolean> isUserRegistered(
            @PathVariable Long contestId,
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                contestService.isUserRegistered(
                        contestId,
                        userId
                )
        );
    }


    // =========================
    // GET PARTICIPANTS
    // =========================

    @GetMapping("/{contestId}/participants")
    public ResponseEntity<List<ContestParticipantResponse>> getParticipants(
            @PathVariable Long contestId) {

        return ResponseEntity.ok(
                contestService.getParticipantResponses(
                        contestId
                )
        );
    }


    // =========================
    // START CONTEST
    // =========================

    @PostMapping("/{contestId}/start")
    public ResponseEntity<ContestStartResponse> startContest(
            @PathVariable Long contestId,
            @RequestParam Long userId) {

        ContestParticipant participant =
                contestService.startContest(
                        contestId,
                        userId
                );

        ContestStartResponse response =
                new ContestStartResponse(
                        participant.getId(),
                        participant.getContest().getId(),
                        participant.getUser().getId(),
                        participant.getStartedAt() != null,
                        participant.getStartedAt(),
                        participant.getExpiresAt(),
                        "Contest started successfully"
                );

        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{contestId}/registration/{userId}")
    public ResponseEntity<ContestRegistrationResponse> getRegistrationDetails(
            @PathVariable Long contestId,
            @PathVariable Long userId) {

        ContestRegistrationResponse response =
                contestService.getRegistrationDetails(
                        contestId,
                        userId
                );

        return ResponseEntity.ok(response);
    
 }
}