package com.Av.Online.Coding.Practice.Platform.Service;

import org.springframework.beans.factory.annotation.Value;

import java.time.LocalDateTime;

import java.util.ArrayList;

import java.util.HashSet;

import java.util.List;

import java.util.Set;

import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.ContestParticipantRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.ContestProblemRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.ContestRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;

import com.Av.Online.Coding.Practice.Platform.dto.ContestProblemResponse;

import com.Av.Online.Coding.Practice.Platform.dto.ContestParticipantResponse;

import com.Av.Online.Coding.Practice.Platform.dto.ContestProblemResultResponse;

import com.Av.Online.Coding.Practice.Platform.dto.ContestRegistrationResponse;

import com.Av.Online.Coding.Practice.Platform.dto.ContestResponse;

import com.Av.Online.Coding.Practice.Platform.dto.ContestSubmissionResponse;

import com.Av.Online.Coding.Practice.Platform.dto.MyContestResultResponse;

import com.Av.Online.Coding.Practice.Platform.dto.ContestPlayProblemResponse;

import com.Av.Online.Coding.Practice.Platform.entity.Contest;

import com.Av.Online.Coding.Practice.Platform.entity.ContestParticipant;

import com.Av.Online.Coding.Practice.Platform.entity.ContestProblem;

import com.Av.Online.Coding.Practice.Platform.entity.ContestStatus;

import com.Av.Online.Coding.Practice.Platform.entity.Problem;

import com.Av.Online.Coding.Practice.Platform.entity.Role;

import com.Av.Online.Coding.Practice.Platform.entity.Submission;

import com.Av.Online.Coding.Practice.Platform.entity.User;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;

import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;

import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;

import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service

public class ContestService {

    @Value("${app.frontend.base-url:http://localhost:5173}")

    private String frontendBaseUrl;

    private final ContestRepository contestRepository;

    private final ContestProblemRepository contestProblemRepository;

    private final ContestParticipantRepository contestParticipantRepository;

    private final ProblemRepository problemRepository;

    private final UserRepository userRepository;

    private final SubmissionRepository submissionRepository;

    private final EmailService emailService;

    public ContestService(

            ContestRepository contestRepository,

            ContestProblemRepository contestProblemRepository,

            ContestParticipantRepository contestParticipantRepository,

            ProblemRepository problemRepository,

            UserRepository userRepository,

            SubmissionRepository submissionRepository,

            EmailService emailService) {

        this.contestRepository = contestRepository;

        this.contestProblemRepository = contestProblemRepository;

        this.contestParticipantRepository = contestParticipantRepository;

        this.problemRepository = problemRepository;

        this.userRepository = userRepository;

        this.submissionRepository = submissionRepository;

        this.emailService = emailService;

    }

    // =========================================
    // CONTEST METHODS
    // =========================================

    public Contest createContest(

            Contest contest,

            Long createdByUserId) {

        User user =

                userRepository.findById(createdByUserId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        validateContestSchedule(contest);

        contest.setCreatedBy(user);

        contest.setEndTime(

                contest.getStartTime()

                        .plusMinutes(

                                contest.getDurationMinutes()

                        )

        );

        contest.setStatus(ContestStatus.DRAFT);

        return contestRepository.save(contest);

    }

    public List<Contest> getAllContests() {

        List<Contest> contests =

                contestRepository

                        .findAllByOrderByStartTimeDesc();

        contests.forEach(

                this::updateContestStatus

        );

        return contests;

    }

    public Contest getContestById(Long id) {

        Contest contest =

                contestRepository.findById(id)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        updateContestStatus(contest);

        return contest;

    }

    public List<Contest> getContestsByStatus(

            ContestStatus status) {

        List<Contest> allContests =

                contestRepository

                        .findAllByOrderByStartTimeDesc();

        allContests.forEach(

                this::updateContestStatus

        );

        return contestRepository

                .findByStatusOrderByStartTimeAsc(

                        status

                );

    }

    // =========================================
    // UPDATE CONTEST
    // =========================================

    @Transactional

    public Contest updateContest(

            Long id,

            Contest updatedContest) {

        Contest existingContest =

                contestRepository.findById(id)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        updateContestStatus(existingContest);

        if (existingContest.getStatus()

                    != ContestStatus.DRAFT

                &&

                existingContest.getStatus()

                    != ContestStatus.UPCOMING) {

            throw new ConflictException(

                    "Only DRAFT or UPCOMING contests can be edited"

            );

        }

        // =====================================================
        // STORE OLD SCHEDULE VALUES
        // =====================================================

        LocalDateTime oldRegistrationStartTime =

                existingContest.getRegistrationStartTime();

        LocalDateTime oldRegistrationEndTime =

                existingContest.getRegistrationEndTime();

        LocalDateTime oldStartTime =

                existingContest.getStartTime();

        // =====================================================
        // UPDATE CONTEST DETAILS
        // =====================================================

        existingContest.setTitle(

                updatedContest.getTitle()

        );

        existingContest.setDescription(

                updatedContest.getDescription()

        );

        existingContest.setRegistrationStartTime(

                updatedContest.getRegistrationStartTime()

        );

        existingContest.setRegistrationEndTime(

                updatedContest.getRegistrationEndTime()

        );

        existingContest.setStartTime(

                updatedContest.getStartTime()

        );

        existingContest.setDurationMinutes(

                updatedContest.getDurationMinutes()

        );

        // =====================================================
        // VALIDATE UPDATED SCHEDULE
        // =====================================================

        validateContestSchedule(existingContest);

        // =====================================================
        // RECALCULATE END TIME
        // =====================================================

        existingContest.setEndTime(

                existingContest.getStartTime()

                        .plusMinutes(

                                existingContest.getDurationMinutes()

                        )

        );

        // =====================================================
        // SAVE UPDATED CONTEST
        // =====================================================

        Contest savedContest =

                contestRepository.save(existingContest);

        // =====================================================
        // CHECK WHETHER IMPORTANT SCHEDULE CHANGED
        // =====================================================

        boolean scheduleChanged =

                !java.util.Objects.equals(

                        oldRegistrationStartTime,

                        savedContest.getRegistrationStartTime()

                )

                ||

                !java.util.Objects.equals(

                        oldRegistrationEndTime,

                        savedContest.getRegistrationEndTime()

                )

                ||

                !java.util.Objects.equals(

                        oldStartTime,

                        savedContest.getStartTime()

                );

        // =====================================================
        // SEND SCHEDULE UPDATE EMAILS
        //
        // Only for UPCOMING contests and only when:
        // - Registration opening time changed
        // - Registration deadline changed
        // - Contest start time changed
        // =====================================================

        if (savedContest.getStatus() == ContestStatus.UPCOMING

                && scheduleChanged) {

            sendContestScheduleUpdateEmails(savedContest);

        }

        return savedContest;

    }

    // =====================================================
    // SEND CONTEST SCHEDULE UPDATE EMAILS
    // =====================================================

    private void sendContestScheduleUpdateEmails(

            Contest contest) {

        List<User> activeUsers =

                userRepository.findByActive(true);

        for (User user : activeUsers) {

            if (user.getRole() != Role.USER) {

                continue;

            }

            if (user.getEmail() == null

                    || user.getEmail().trim().isEmpty()) {

                continue;

            }

            try {

                emailService.sendContestScheduleUpdate(

                        user.getEmail(),

                        user.getName(),

                        contest.getTitle(),

                        contest.getRegistrationStartTime() != null

                                ? contest.getRegistrationStartTime().toString()

                                : null,

                        contest.getRegistrationEndTime() != null

                                ? contest.getRegistrationEndTime().toString()

                                : null,

                        contest.getStartTime() != null

                                ? contest.getStartTime().toString()

                                : null,

                        contest.getDurationMinutes()

                );

            } catch (Exception e) {

                System.err.println(

                        "Failed to send contest schedule update to "

                                + user.getEmail()

                                + ": "

                                + e.getMessage()

                );

            }

        }

    }

    // =========================================
    // PUBLISH CONTEST
    // =========================================

    @Transactional

    public Contest publishContest(Long contestId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        if (contest.getStatus()

                != ContestStatus.DRAFT) {

            throw new ConflictException(

                    "Only DRAFT contests can be published"

            );

        }

        validateContestSchedule(contest);

        LocalDateTime now =

                LocalDateTime.now();

        if (!contest.getStartTime()

                .isAfter(now)) {

            throw new BadRequestException(

                    "Contest start time must be in the future before publishing"

            );

        }

        if (contest.getRegistrationEndTime()

                == null) {

            throw new BadRequestException(

                    "Registration end time is required before publishing"

            );

        }

        contest.setEndTime(

                contest.getStartTime()

                        .plusMinutes(

                                contest.getDurationMinutes()

                        )

        );

        contest.setStatus(

                ContestStatus.UPCOMING

        );

        Contest publishedContest =

                contestRepository.save(contest);

        // =========================================
        // SEND CONTEST INVITATION EMAILS
        // =========================================

        List<User> activeUsers =

                userRepository.findByActive(true);

        String registrationLink =

                frontendBaseUrl + "/contests/"

                        + publishedContest.getId()

                        + "/register";

        for (User user : activeUsers) {

            if (user.getRole() != Role.USER) {

                continue;

            }

            if (user.getEmail() == null

                    || user.getEmail()

                            .trim()

                            .isEmpty()) {

                continue;

            }

            try {

                emailService.sendContestInvitation(

                        user.getEmail(),

                        user.getName(),

                        publishedContest.getTitle(),

                        publishedContest

                                .getStartTime()

                                .toString(),

                        publishedContest

                                .getDurationMinutes(),

                        publishedContest

                                .getRegistrationEndTime()

                                .toString(),

                        registrationLink

                );

            } catch (Exception e) {

                // Do not fail contest publishing because
                // an email could not be sent.
            }

        }

        return publishedContest;

    }

    // =========================================
    // CANCEL CONTEST
    // =========================================

    @Transactional

    public Contest cancelContest(Long contestId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found")

                        );

        updateContestStatus(contest);

        if (contest.getStatus() != ContestStatus.DRAFT

                && contest.getStatus()

                        != ContestStatus.UPCOMING) {

            throw new ConflictException(

                    "Only DRAFT or UPCOMING contests can be cancelled"

            );

        }

        contest.setStatus(

                ContestStatus.CANCELLED

        );

        return contestRepository.save(contest);

    }

    // =========================================
    // END CONTEST
    // =========================================

    @Transactional

    public Contest endContest(Long contestId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"

                                )

                        );

        updateContestStatus(contest);

        if (contest.getStatus()

                != ContestStatus.LIVE) {

            throw new ConflictException(

                    "Only LIVE contests can be ended"

            );

        }

        contest.setStatus(

                ContestStatus.FINISHED

        );

        return contestRepository.save(contest);

    }

    // =========================================
    // DELETE CONTEST
    // =========================================

    @Transactional

    public void deleteContest(Long id) {

        Contest contest =

                contestRepository.findById(id)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        contestProblemRepository

                .deleteByContest(contest);

        contestParticipantRepository

                .deleteByContest(contest);

        contestRepository.delete(contest);

    }

    // =========================================
    // CONTEST PROBLEM METHODS
    // =========================================

    public ContestProblemResponse addProblemToContest(

            Long contestId,

            Long problemId,

            Integer problemOrder,

            Integer points) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        Problem problem =

                problemRepository.findById(problemId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Problem not found"));

        if (contestProblemRepository

                .findByContestOrderByProblemOrderAsc(contest)

                .stream()

                .anyMatch(cp ->

                        cp.getProblem()

                                .getId()

                                .equals(problemId))) {

            throw new ConflictException(

                    "Problem is already added to this contest"

            );

        }

        ContestProblem contestProblem =

                new ContestProblem();

        contestProblem.setContest(contest);

        contestProblem.setProblem(problem);

        contestProblem.setProblemOrder(problemOrder);

        contestProblem.setPoints(points);

        ContestProblem saved = contestProblemRepository.save(

                contestProblem

        );

        return toContestProblemResponse(saved);

    }

    @Transactional(readOnly = true)

    public List<ContestProblemResponse> getContestProblems(

            Long contestId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        return contestProblemRepository

                .findByContestOrderByProblemOrderAsc(

                        contest

                )

                .stream()

                .map(this::toContestProblemResponse)

                .toList();

    }

    private ContestProblemResponse toContestProblemResponse(

            ContestProblem contestProblem) {

        /*
          Build this response without calling toContestResponse(contest).
          toContestResponse() reads contest.getCreatedBy().getName(), and
          createdBy is a LAZY User association. That caused the
          LazyInitializationException seen on GET /api/contests/{id}/problems.
        */

        Long contestId =

                contestProblem.getContest().getId();

        Long problemId =

                contestProblem.getProblem().getId();

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        Problem problem =

                problemRepository.findById(problemId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Problem not found"));

        Long createdById = null;

        String createdByName = null;

        if (contest.getCreatedBy() != null) {

            createdById =

                    contest.getCreatedBy().getId();

            User createdBy =

                    userRepository.findById(createdById)

                            .orElse(null);

            if (createdBy != null) {

                createdByName =

                        createdBy.getName();

            }

        }

        ContestResponse contestResponse =

                new ContestResponse(

                        contest.getId(),

                        contest.getTitle(),

                        contest.getDescription(),

                        contest.getRegistrationStartTime(),

                        contest.getRegistrationEndTime(),

                        contest.getStartTime(),

                        contest.getEndTime(),

                        contest.getDurationMinutes(),

                        contest.getStatus(),

                        createdById,

                        createdByName

                );

        return new ContestProblemResponse(

                contestProblem.getId(),

                contestResponse,

                new com.Av.Online.Coding.Practice.Platform.dto.ProblemResponse(

                        problem

                ),

                contestProblem.getProblemOrder(),

                contestProblem.getPoints()

        );

    }

    public void removeProblemFromContest(

            Long contestProblemId) {

        if (!contestProblemRepository

                .existsById(contestProblemId)) {

            throw new ResourceNotFoundException(

                    "Contest problem not found"

            );

        }

        contestProblemRepository

                .deleteById(contestProblemId);

    }

    // =========================================
    // REGISTER USER
    // =========================================

    public ContestParticipant registerUser(

            Long contestId,

            Long userId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        updateContestStatus(contest);

        if (contest.getStatus()

                != ContestStatus.UPCOMING) {

            throw new ConflictException(

                    "Registration is closed for this contest"

            );

        }

        LocalDateTime now =

                LocalDateTime.now();

        if (contest.getRegistrationStartTime()

                    != null

                &&

                now.isBefore(

                        contest.getRegistrationStartTime()

                )) {

            throw new ConflictException(

                    "Registration has not started yet"

            );

        }

        if (contest.getRegistrationEndTime()

                    != null

                &&

                !now.isBefore(

                        contest.getRegistrationEndTime()

                )) {

            throw new ConflictException(

                    "Registration is closed for this contest"

            );

        }

        if (contestParticipantRepository

                .existsByContestAndUser(

                        contest,

                        user

                )) {

            throw new ConflictException(

                    "User is already registered"

            );

        }

        ContestParticipant participant =

                new ContestParticipant();

        participant.setContest(contest);

        participant.setUser(user);

        participant.setRegisteredAt(now);

        participant.setScore(0);

        participant.setRank(0);

        ContestParticipant savedParticipant =

                contestParticipantRepository

                        .save(participant);

        // =========================================
        // SEND REGISTRATION CONFIRMATION EMAIL
        // =========================================

        if (user.getEmail() != null

                && !user.getEmail()

                        .trim()

                        .isEmpty()) {

            try {

                emailService

                        .sendContestRegistrationConfirmation(

                                user.getEmail(),

                                user.getName(),

                                contest.getTitle(),

                                contest.getStartTime()

                                        .toString(),

                                contest.getDurationMinutes()

                        );

            } catch (Exception e) {

                // Do not fail registration because
                // an email could not be sent.
            }

        }

        return savedParticipant;

    }

    // =========================================
    // CHECK USER REGISTRATION
    // =========================================

    public boolean isUserRegistered(

            Long contestId,

            Long userId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        return contestParticipantRepository

                .existsByContestAndUser(

                        contest,

                        user

                );

    }

    // =========================================
    // GET PARTICIPANTS
    // =========================================

    public List<ContestParticipant> getParticipants(

            Long contestId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        return contestParticipantRepository

                .findByContestOrderByScoreDesc(

                        contest

                );

    }

    // =========================================
    // STATUS LIFECYCLE
    // =========================================

    private void updateContestStatus(

            Contest contest) {

        if (contest == null

                || contest.getStatus() == null) {

            return;

        }

        if (contest.getStatus()

                    == ContestStatus.DRAFT

                ||

                contest.getStatus()

                    == ContestStatus.CANCELLED

                ||

                contest.getStatus()

                    == ContestStatus.FINISHED) {

            return;

        }

        if (contest.getStartTime() == null

                || contest.getEndTime() == null) {

            return;

        }

        LocalDateTime now =

                LocalDateTime.now();

        if (!now.isBefore(

                contest.getEndTime()

        )) {

            contest.setStatus(

                    ContestStatus.FINISHED

            );

            contestRepository.save(contest);

            return;

        }

        if (contest.getStatus()

                    == ContestStatus.UPCOMING

                &&

                !now.isBefore(

                        contest.getStartTime()

                )) {

            contest.setStatus(

                    ContestStatus.LIVE

            );

            contestRepository.save(contest);

        }

    }

    // =========================================
    // CONTEST RESPONSE
    // =========================================

    public ContestResponse toContestResponse(

            Contest contest) {

        Long createdById = null;

        String createdByName = null;

        if (contest.getCreatedBy() != null) {

            createdById =

                    contest.getCreatedBy()

                            .getId();

            createdByName =

                    contest.getCreatedBy()

                            .getName();

        }

        return new ContestResponse(

                contest.getId(),

                contest.getTitle(),

                contest.getDescription(),

                contest.getRegistrationStartTime(),

                contest.getRegistrationEndTime(),

                contest.getStartTime(),

                contest.getEndTime(),

                contest.getDurationMinutes(),

                contest.getStatus(),

                createdById,

                createdByName

        );

    }

    // =========================================
    // PARTICIPANT RESPONSE
    // =========================================

    public List<ContestParticipantResponse>

    getParticipantResponses(Long contestId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        updateContestStatus(contest);

        List<ContestParticipant> participants =

                contestParticipantRepository

                        .findByContestOrderByScoreDesc(

                                contest

                        );

        List<ContestParticipantResponse> responses =

                new ArrayList<>();

        int rank = 1;

        for (ContestParticipant participant :

                participants) {

            User user =

                    participant.getUser();

            ContestParticipantResponse response =

                    new ContestParticipantResponse(

                            participant.getId(),

                            user.getId(),

                            user.getName(),

                            user.getEmail(),

                            participant.getRegisteredAt(),

                            participant.getScore(),

                            rank

                    );

            responses.add(response);

            rank++;

        }

        return responses;

    }

    // =========================================
    // START CONTEST
    // =========================================

    @Transactional

    public ContestParticipant startContest(

            Long contestId,

            Long userId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        updateContestStatus(contest);

        if (contest.getStatus()

                != ContestStatus.LIVE) {

            throw new ConflictException(

                    "Contest is not currently live"

            );

        }

        ContestParticipant participant =

                contestParticipantRepository

                        .findByContestAndUser(

                                contest,

                                user

                        )

                        .orElseThrow(() ->

                                new ForbiddenException(

                                        "You are not registered for this contest"

                                )

                        );

        if (participant.getStartedAt() != null) {

            return participant;

        }

        LocalDateTime startedAt =

                LocalDateTime.now();

        LocalDateTime expiresAt =

                startedAt.plusMinutes(

                        contest.getDurationMinutes()

                );

        if (expiresAt.isAfter(

                contest.getEndTime()

        )) {

            expiresAt =

                    contest.getEndTime();

        }

        participant.setStartedAt(

                startedAt

        );

        participant.setExpiresAt(

                expiresAt

        );

        return contestParticipantRepository

                .save(participant);

    }

    // =========================================
    // MY CONTEST RESULTS
    // =========================================

    @Transactional

    public List<MyContestResultResponse>

    getMyContestResults(Long userId) {

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        List<ContestParticipant> participants =

                contestParticipantRepository

                        .findByUserOrderByRegisteredAtDesc(

                                user

                        );

        List<MyContestResultResponse> results =

                new ArrayList<>();

        for (ContestParticipant participant :

                participants) {

            Contest contest =

                    participant.getContest();

            updateContestStatus(contest);

            List<ContestProblem> contestProblems =

                    contestProblemRepository

                            .findByContestOrderByProblemOrderAsc(

                                    contest

                            );

            Set<Long> contestProblemIds =

                    contestProblems.stream()

                            .map(cp ->

                                    cp.getProblem()

                                            .getId()

                            )

                            .collect(

                                    Collectors.toSet()

                            );

            List<Submission> submissions =

                    submissionRepository

                            .findByContestIdAndUserIdOrderBySubmittedAtDesc(

                                    contest.getId(),

                                    userId

                            );

            int totalSubmissions = 0;

            Set<Long> solvedProblems =

                    new HashSet<>();

            for (Submission submission :

                    submissions) {

                if (!contestProblemIds.contains(

                        submission.getProblemId()

                )) {

                    continue;

                }

                totalSubmissions++;

                if (isAccepted(

                        submission.getStatus()

                )) {

                    solvedProblems.add(

                            submission.getProblemId()

                    );

                }

            }

            List<ContestParticipant> allParticipants =

                    contestParticipantRepository

                            .findByContestOrderByScoreDesc(

                                    contest

                            );

            int rank = 1;

            int participantScore =

                    participant.getScore() == null

                            ? 0

                            : participant.getScore();

            for (ContestParticipant other :

                    allParticipants) {

                int otherScore =

                        other.getScore() == null

                                ? 0

                                : other.getScore();

                if (otherScore >

                        participantScore) {

                    rank++;

                } else if (

                        otherScore ==

                                participantScore) {

                    if (other.getId() <

                            participant.getId()) {

                        rank++;

                    }

                }

            }

            String startTime = null;

            String endTime = null;

            if (participant.getStartedAt()

                    != null) {

                startTime =

                        participant.getStartedAt()

                                .toString();

            }

            if (participant.getExpiresAt()

                    != null) {

                endTime =

                        participant.getExpiresAt()

                                .toString();

            }

            MyContestResultResponse response =

                    new MyContestResultResponse(

                            contest.getId(),

                            contest.getTitle(),

                            contest.getStatus().name(),

                            participantScore,

                            rank,

                            solvedProblems.size(),

                            totalSubmissions,

                            startTime,

                            endTime,

                            contest.getDurationMinutes()

                    );

            results.add(response);

        }

        return results;

    }

    // =========================================
    // ACCEPTED STATUS CHECK
    // =========================================

    private boolean isAccepted(

            String status) {

        if (status == null) {

            return false;

        }

        String normalizedStatus =

                status.trim()

                        .toLowerCase();

        return normalizedStatus.equals(

                    "accepted")

                ||

                normalizedStatus.equals(

                    "success")

                ||

                normalizedStatus.contains(

                    "accepted");

    }

    // =========================================
    // PROBLEM-WISE CONTEST RESULTS
    // =========================================

    @Transactional

    public List<ContestProblemResultResponse>

    getContestProblemResults(

            Long contestId,

            Long userId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        ContestParticipant participant =

                contestParticipantRepository

                        .findByContestAndUser(

                                contest,

                                user

                        )

                        .orElseThrow(() ->

                                new ForbiddenException(

                                        "User is not registered for this contest"

                                )

                        );

        List<ContestProblem> contestProblems =

                contestProblemRepository

                        .findByContestOrderByProblemOrderAsc(

                                contest

                        );

        List<Submission> submissions =

                submissionRepository

                        .findByContestIdAndUserIdOrderBySubmittedAtDesc(

                                contestId,

                                userId

                        );

        List<ContestProblemResultResponse> results =

                new ArrayList<>();

        for (ContestProblem contestProblem :

                contestProblems) {

            Problem problem =

                    contestProblem.getProblem();

            Long problemId =

                    problem.getId();

            List<Submission> problemSubmissions =

                    submissions.stream()

                            .filter(submission ->

                                    problemId.equals(

                                            submission.getProblemId()

                                    )

                            )

                            .collect(

                                    Collectors.toList()

                            );

            int submissionCount =

                    problemSubmissions.size();

            Submission acceptedSubmission =

                    problemSubmissions.stream()

                            .filter(submission ->

                                    isAccepted(

                                            submission.getStatus()

                                    )

                            )

                            .min(

                                    (a, b) ->

                                            a.getSubmittedAt()

                                                    .compareTo(

                                                            b.getSubmittedAt()

                                                    )

                            )

                            .orElse(null);

            boolean solved =

                    acceptedSubmission != null;

            String status =

                    "NOT_ATTEMPTED";

            String submittedAt = null;

            String timeTaken = null;

            if (!problemSubmissions.isEmpty()) {

                Submission latestSubmission =

                        problemSubmissions.get(0);

                status =

                        latestSubmission.getStatus();

                submittedAt =

                        latestSubmission

                                .getSubmittedAt()

                                .toString();

            }

            if (acceptedSubmission != null) {

                submittedAt =

                        acceptedSubmission

                                .getSubmittedAt()

                                .toString();

                if (participant.getStartedAt()

                        != null) {

                    long seconds =

                            java.time.Duration

                                    .between(

                                            participant.getStartedAt(),

                                            acceptedSubmission

                                                    .getSubmittedAt()

                                    )

                                    .getSeconds();

                    if (seconds < 0) {

                        seconds = 0;

                    }

                    long hours =

                            seconds / 3600;

                    long minutes =

                            (seconds % 3600) / 60;

                    long remainingSeconds =

                            seconds % 60;

                    if (hours > 0) {

                        timeTaken =

                                String.format(

                                        "%02d:%02d:%02d",

                                        hours,

                                        minutes,

                                        remainingSeconds

                                );

                    } else {

                        timeTaken =

                                String.format(

                                        "%02d:%02d",

                                        minutes,

                                        remainingSeconds

                                );

                    }

                }

            }

            Integer points =

                    contestProblem.getPoints() == null

                            ? 0

                            : contestProblem.getPoints();

            ContestProblemResultResponse response =

                    new ContestProblemResultResponse(

                            problemId,

                            problem.getTitle(),

                            contestProblem

                                    .getProblemOrder(),

                            points,

                            solved,

                            submissionCount,

                            status,

                            submittedAt,

                            timeTaken

                    );

            results.add(response);

        }

        return results;

    }

    // =========================================
    // CONTEST PROBLEM SUBMISSIONS
    // =========================================

    public List<ContestSubmissionResponse>

    getContestProblemSubmissions(

            Long contestId,

            Long userId,

            Long problemId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        contestParticipantRepository

                .findByContestAndUser(

                        contest,

                        user

                )

                .orElseThrow(() ->

                        new ForbiddenException(

                                "User is not registered for this contest"

                        )

                );

        List<ContestProblem> contestProblems =

                contestProblemRepository

                        .findByContestOrderByProblemOrderAsc(

                                contest

                        );

        ContestProblem contestProblem =

                contestProblems.stream()

                        .filter(cp ->

                                cp.getProblem()

                                        .getId()

                                        .equals(problemId)

                        )

                        .findFirst()

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Problem does not belong to this contest"

                                )

                        );

        Problem problem =

                contestProblem.getProblem();

        List<Submission> submissions =

                submissionRepository

                        .findByContestIdAndUserIdOrderBySubmittedAtDesc(

                                contestId,

                                userId

                        );

        List<ContestSubmissionResponse> results =

                new ArrayList<>();

        for (Submission submission :

                submissions) {

            if (!problemId.equals(

                    submission.getProblemId()

            )) {

                continue;

            }

            String submittedAt = null;

            if (submission.getSubmittedAt()

                    != null) {

                submittedAt =

                        submission.getSubmittedAt()

                                .toString();

            }

            ContestSubmissionResponse response =

                    new ContestSubmissionResponse(

                            submission.getId(),

                            problem.getId(),

                            problem.getTitle(),

                            submission.getCode(),

                            submission.getLanguage(),

                            submission.getStatus(),

                            submittedAt

                    );

            results.add(response);

        }

        return results;

    }

    // =========================================
    // CONTEST SCHEDULE VALIDATION
    // =========================================

    private void validateContestSchedule(

            Contest contest) {

        if (contest.getTitle() == null

                ||

                contest.getTitle()

                        .trim()

                        .isEmpty()) {

            throw new BadRequestException(

                    "Contest title is required"

            );

        }

        if (contest.getStartTime() == null) {

            throw new BadRequestException(

                    "Contest start time is required"

            );

        }

        if (contest.getDurationMinutes() == null

                ||

                contest.getDurationMinutes() <= 0) {

            throw new BadRequestException(

                    "Contest duration must be greater than 0"

            );

        }

        if (contest.getRegistrationStartTime()

                    != null

                &&

                contest.getRegistrationEndTime()

                    != null

                &&

                contest.getRegistrationEndTime()

                        .isBefore(

                                contest.getRegistrationStartTime()

                        )) {

            throw new BadRequestException(

                    "Registration end time cannot be before registration start time"

            );

        }

        if (contest.getRegistrationEndTime()

                    != null

                &&

                contest.getRegistrationEndTime()

                        .isAfter(

                                contest.getStartTime()

                        )) {

            throw new BadRequestException(

                    "Registration deadline cannot be after contest start time"

            );

        }

    }

    // =========================================
    // REGISTRATION DETAILS
    // =========================================

    public ContestRegistrationResponse getRegistrationDetails(

            Long contestId,

            Long userId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        ContestParticipant participant =

                contestParticipantRepository

                        .findByContestAndUser(

                                contest,

                                user

                        )

                        .orElse(null);

        if (participant == null) {

            return new ContestRegistrationResponse(

                    false,

                    null,

                    false,

                    null,

                    null

            );

        }

        return new ContestRegistrationResponse(

                true,

                participant.getRegisteredAt(),

                participant.getStartedAt() != null,

                participant.getStartedAt(),

                participant.getExpiresAt()

        );

    }

    // ========================================
    // GET PROTECTED CONTEST PLAY PROBLEMS
    // ========================================

    public List<ContestPlayProblemResponse> getContestPlayProblems(

            Long contestId,

            Long userId) {

        Contest contest =

                contestRepository.findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "Contest not found"));

        updateContestStatus(contest);

        if (contest.getStatus() != ContestStatus.LIVE) {

            throw new ConflictException(

                    "Contest is not live");

        }

        User user =

                userRepository.findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException(

                                        "User not found"));

        ContestParticipant participant =

                contestParticipantRepository

                        .findByContestAndUser(contest, user)

                        .orElseThrow(() ->

                                new ForbiddenException(

                                        "User is not registered for this contest"));

        if (participant.getStartedAt() == null ||

                participant.getExpiresAt() == null) {

            throw new ConflictException(

                    "Contest session has not been started");

        }

        LocalDateTime now = LocalDateTime.now();

        if (!now.isBefore(participant.getExpiresAt())) {

            throw new ConflictException(

                    "Contest session has expired");

        }

        if (contest.getEndTime() != null &&

                !now.isBefore(contest.getEndTime())) {

            throw new ConflictException(

                    "Contest has ended");

        }

        List<ContestProblem> contestProblems =

                contestProblemRepository

                        .findByContestOrderByProblemOrderAsc(contest);

        return contestProblems.stream()

                .map(contestProblem -> {

                    Problem problem =

                            contestProblem.getProblem();

                    return new ContestPlayProblemResponse(

                            contestProblem.getId(),

                            problem.getId(),

                            contestProblem.getProblemOrder(),

                            contestProblem.getPoints(),

                            problem.getTitle(),

                            problem.getDescription(),

                            problem.getDifficulty(),

                            problem.getCategory(),

                            problem.getInputFormat(),

                            problem.getOutputFormat(),

                            problem.getConstraints()

                    );

                })

                .collect(Collectors.toList());

    }

}