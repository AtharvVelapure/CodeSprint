package com.Av.Online.Coding.Practice.Platform.Service;

import java.time.LocalDateTime;

import java.util.ArrayList;

import java.util.List;

import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.ContestParticipantRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.ContestProblemRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.ContestRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;

import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;

import com.Av.Online.Coding.Practice.Platform.dto.ContestSubmissionResponse;

import com.Av.Online.Coding.Practice.Platform.dto.RunCodeRequest;

import com.Av.Online.Coding.Practice.Platform.dto.RunCodeResponse;

import com.Av.Online.Coding.Practice.Platform.entity.Contest;

import com.Av.Online.Coding.Practice.Platform.entity.ContestParticipant;

import com.Av.Online.Coding.Practice.Platform.entity.ContestProblem;

import com.Av.Online.Coding.Practice.Platform.entity.ContestStatus;

import com.Av.Online.Coding.Practice.Platform.entity.Problem;

import com.Av.Online.Coding.Practice.Platform.entity.Submission;

import com.Av.Online.Coding.Practice.Platform.entity.User;

import com.Av.Online.Coding.Practice.Platform.exception.BadRequestException;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service

public class ContestSubmissionService {

    private final ContestRepository contestRepository;

    private final UserRepository userRepository;

    private final ContestParticipantRepository contestParticipantRepository;

    private final ContestProblemRepository contestProblemRepository;

    private final SubmissionRepository submissionRepository;

    private final SubmitCodeService submitCodeService;



    public ContestSubmissionService(

            ContestRepository contestRepository,

            UserRepository userRepository,

            ContestParticipantRepository contestParticipantRepository,

            ContestProblemRepository contestProblemRepository,

            SubmissionRepository submissionRepository,

            SubmitCodeService submitCodeService) {

        this.contestRepository =

                contestRepository;

        this.userRepository =

                userRepository;

        this.contestParticipantRepository =

                contestParticipantRepository;

        this.contestProblemRepository =

                contestProblemRepository;

        this.submissionRepository =

                submissionRepository;

        this.submitCodeService =

                submitCodeService;

    }



    // =========================================================

    // RUN CONTEST CODE

    // Validates contest session before execution.

    // IMPORTANT: This does NOT save a Submission or update score.

    // =========================================================

    public RunCodeResponse runContestCode(

            Long contestId,

            Long userId,

            Long problemId,

            String code,

            String language) {

        Contest contest =

                contestRepository

                        .findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException("Contest not found")

                        );

        User user =

                userRepository

                        .findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException("User not found")

                        );

        updateContestStatus(contest);

        if (contest.getStatus() != ContestStatus.LIVE) {

            throw new ConflictException("Contest is not currently active");

        }

        ContestParticipant participant =

                contestParticipantRepository

                        .findByContestAndUser(

                                contest,

                                user

                        )

                        .orElseThrow(() ->

                                new ForbiddenException("User is not registered for this contest")

                        );

        if (participant.getStartedAt() == null) {

            throw new ConflictException("You have not started this contest");

        }

        if (participant.getExpiresAt() == null) {

            throw new ConflictException("Contest session expiry time is missing");

        }

        LocalDateTime now = LocalDateTime.now();

        if (!now.isBefore(participant.getExpiresAt())) {

            throw new ConflictException("Your contest time has expired");

        }

        if (contest.getEndTime() != null

                && !now.isBefore(contest.getEndTime())) {

            throw new ConflictException("Contest has ended");

        }

        if (code == null || code.trim().isEmpty()) {

            throw new BadRequestException("Code cannot be empty");

        }

        if (language == null || language.trim().isEmpty()) {

            throw new BadRequestException("Programming language is required");

        }

        boolean problemBelongsToContest =

                contestProblemRepository

                        .findByContestOrderByProblemOrderAsc(

                                contest

                        )

                        .stream()

                        .anyMatch(contestProblem ->

                                contestProblem.getProblem() != null

                                        && contestProblem

                                                .getProblem()

                                                .getId()

                                                .equals(problemId)

                        );

        if (!problemBelongsToContest) {

            throw new BadRequestException("Problem does not belong to this contest");

        }

        RunCodeRequest judgeRequest =

                new RunCodeRequest();

        judgeRequest.setUserId(userId);

        judgeRequest.setProblemId(problemId);

        judgeRequest.setLanguage(language);

        judgeRequest.setCode(code);

        return submitCodeService.judgeCode(

                judgeRequest

        );

    }



    // =========================================================

    // SUBMIT CONTEST SOLUTION

    // =========================================================

    @Transactional

    public RunCodeResponse submitContestSolution(

            Long contestId,

            Long userId,

            Long problemId,

            String code,

            String language) {

        // =====================================================

        // FIND CONTEST

        // =====================================================

        Contest contest =

                contestRepository

                        .findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException("Contest not found")

                        );



        // =====================================================

        // FIND USER

        // =====================================================

        User user =

                userRepository

                        .findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException("User not found")

                        );



        // =====================================================

        // UPDATE CONTEST STATUS

        // =====================================================

        updateContestStatus(contest);



        // =====================================================

        // CONTEST MUST BE LIVE

        // =====================================================

        if (contest.getStatus()

                != ContestStatus.LIVE) {

            throw new ConflictException("Contest is not currently active");

        }



        // =====================================================

        // CHECK REGISTRATION

        // =====================================================

        ContestParticipant participant =

                contestParticipantRepository

                        .findByContestAndUser(

                                contest,

                                user

                        )

                        .orElseThrow(() ->

                                new ForbiddenException("User is not registered for this contest")

                        );



        // =====================================================

        // USER MUST HAVE STARTED CONTEST

        // =====================================================

        if (participant.getStartedAt()

                == null) {

            throw new ConflictException("You have not started this contest");

        }



        // =====================================================

        // PERSONAL EXPIRY MUST EXIST

        // =====================================================

        if (participant.getExpiresAt()

                == null) {

            throw new ConflictException("Contest session expiry time is missing");

        }



        LocalDateTime now =

                LocalDateTime.now();



        // =====================================================

        // CHECK PERSONAL TIMER

        // now must be strictly before expiresAt

        // =====================================================

        if (!now.isBefore(

                participant.getExpiresAt())) {

            throw new ConflictException("Your contest time has expired");

        }



        // =====================================================

        // CHECK GLOBAL CONTEST END

        // =====================================================

        if (contest.getEndTime() != null

                && !now.isBefore(

                        contest.getEndTime())) {

            throw new ConflictException("Contest has ended");

        }



        // =====================================================

        // VALIDATE CODE

        // =====================================================

        if (code == null

                || code.trim().isEmpty()) {

            throw new BadRequestException("Code cannot be empty");

        }



        // =====================================================

        // VALIDATE LANGUAGE

        // =====================================================

        if (language == null

                || language.trim().isEmpty()) {

            throw new BadRequestException("Programming language is required");

        }



        // =====================================================

        // CHECK PROBLEM BELONGS TO CONTEST

        // =====================================================

        ContestProblem contestProblem =

                contestProblemRepository

                        .findByContestOrderByProblemOrderAsc(

                                contest

                        )

                        .stream()

                        .filter(cp ->

                                cp.getProblem() != null

                                        && cp.getProblem()

                                                .getId()

                                                .equals(problemId)

                        )

                        .findFirst()

                        .orElseThrow(() ->

                                new BadRequestException("Problem does not belong to this contest")

                        );



        // =====================================================

        // CHECK WHETHER PROBLEM WAS ALREADY SOLVED

        // =====================================================

        List<Submission> previousSubmissions =

                submissionRepository

                        .findByContestIdAndUserIdOrderBySubmittedAtDesc(

                                contestId,

                                userId

                        );



        boolean alreadySolved =

                previousSubmissions

                        .stream()

                        .filter(submission ->

                                isAccepted(

                                        submission.getStatus()

                                )

                        )

                        .anyMatch(submission ->

                                problemId.equals(

                                        submission.getProblemId()

                                )

                        );



        // =====================================================

        // CREATE REQUEST FOR BACKEND JUDGE

        // =====================================================

        RunCodeRequest judgeRequest =

                new RunCodeRequest();

        judgeRequest.setUserId(

                userId

        );

        judgeRequest.setProblemId(

                problemId

        );

        judgeRequest.setLanguage(

                language

        );

        judgeRequest.setCode(

                code

        );



        // =====================================================

        // BACKEND JUDGES THE CODE

        //

        // IMPORTANT:

        // Browser does NOT provide Accepted/Wrong Answer.

        // =====================================================

        RunCodeResponse judgeResponse =

                submitCodeService

                        .judgeCode(

                                judgeRequest

                        );



        // =====================================================

        // DETERMINE STATUS FROM BACKEND JUDGE

        // =====================================================

        String submissionStatus;



        if (judgeResponse.isSuccess()) {

            submissionStatus =

                    "Accepted";

        } else {

            submissionStatus =

                    judgeResponse.getStatus();

            if (submissionStatus == null

                    || submissionStatus

                            .trim()

                            .isEmpty()) {

                submissionStatus =

                        "Failed";

            }

        }



        // =====================================================

        // SAVE ONE CONTEST SUBMISSION

        // =====================================================

        Submission submission =

                new Submission();

        submission.setUserId(

                userId

        );

        submission.setProblemId(

                problemId

        );

        submission.setCode(

                code

        );

        submission.setLanguage(

                language.trim().toLowerCase()

        );

        submission.setStatus(

                submissionStatus

        );

        submission.setSubmittedAt(

                LocalDateTime.now()

        );

        submission.setContestId(

                contestId

        );



        submissionRepository.save(

                submission

        );



        // =====================================================

        // UPDATE SCORE

        //

        // Score only changes when BACKEND judge accepted code.

        // =====================================================

        if (judgeResponse.isSuccess()

                && !alreadySolved) {

            int currentScore =

                    participant.getScore() == null

                            ? 0

                            : participant.getScore();



            int problemPoints =

                    contestProblem.getPoints() == null

                            ? 0

                            : contestProblem.getPoints();



            participant.setScore(

                    currentScore

                            + problemPoints

            );



            contestParticipantRepository.save(

                    participant

            );



            // =============================================

            // UPDATE LEADERBOARD RANKS

            // =============================================

            updateParticipantRanks(

                    contest

            );

        }



        // =====================================================

        // RETURN ACTUAL JUDGE RESULT

        // =====================================================

        return judgeResponse;

    }



    // =========================================================

    // UPDATE PARTICIPANT RANKS

    // =========================================================

    @Transactional

    public void updateParticipantRanks(

            Contest contest) {

        List<ContestParticipant> participants =

                contestParticipantRepository

                        .findByContestOrderByScoreDesc(

                                contest

                        );



        int rank = 1;



        for (

                ContestParticipant participant

                        : participants

        ) {

            participant.setRank(

                    rank

            );



            contestParticipantRepository.save(

                    participant

            );



            rank++;

        }

    }



    // =========================================================

    // ACCEPTED STATUS CHECK

    // =========================================================

    private boolean isAccepted(

            String status) {

        if (status == null) {

            return false;

        }



        String normalizedStatus =

                status.trim()

                        .toLowerCase();



        return normalizedStatus.equals(

                "accepted"

        )

                || normalizedStatus.equals(

                        "success"

                )

                || normalizedStatus.contains(

                        "accepted"

                );

    }



    // =========================================================

    // CONTEST STATUS

    // =========================================================

    private void updateContestStatus(

            Contest contest) {

        if (contest == null

                || contest.getStatus()

                        == null) {

            return;

        }



        // Never automatically change terminal/manual states

        if (contest.getStatus()

                == ContestStatus.DRAFT

                || contest.getStatus()

                == ContestStatus.CANCELLED

                || contest.getStatus()

                == ContestStatus.FINISHED) {

            return;

        }



        if (contest.getStartTime()

                == null

                || contest.getEndTime()

                        == null) {

            return;

        }



        LocalDateTime now =

                LocalDateTime.now();



        // =====================================================

        // UPCOMING / LIVE -> FINISHED

        // =====================================================

        if (!now.isBefore(

                contest.getEndTime())) {

            contest.setStatus(

                    ContestStatus.FINISHED

            );



            contestRepository.save(

                    contest

            );



            return;

        }



        // =====================================================

        // UPCOMING -> LIVE

        // =====================================================

        if (contest.getStatus()

                == ContestStatus.UPCOMING

                && !now.isBefore(

                        contest.getStartTime())) {

            contest.setStatus(

                    ContestStatus.LIVE

            );



            contestRepository.save(

                    contest

            );

        }

    }



    // =========================================================

    // GET PROBLEM-WISE USER CONTEST SUBMISSIONS

    // =========================================================

    public List<ContestSubmissionResponse>

    getContestProblemSubmissions(

            Long contestId,

            Long userId,

            Long problemId) {



        Contest contest =

                contestRepository

                        .findById(contestId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException("Contest not found")

                        );



        User user =

                userRepository

                        .findById(userId)

                        .orElseThrow(() ->

                                new ResourceNotFoundException("User not found")

                        );



        // =====================================================

        // CHECK REGISTRATION

        // =====================================================

        contestParticipantRepository

                .findByContestAndUser(

                        contest,

                        user

                )

                .orElseThrow(() ->

                        new ForbiddenException("User is not registered for this contest")

                );



        // =====================================================

        // CHECK PROBLEM BELONGS TO CONTEST

        // =====================================================

        List<ContestProblem> contestProblems =

                contestProblemRepository

                        .findByContestOrderByProblemOrderAsc(

                                contest

                        );



        ContestProblem contestProblem =

                contestProblems

                        .stream()

                        .filter(cp ->

                                cp.getProblem() != null

                                        && cp.getProblem()

                                                .getId()

                                                .equals(problemId)

                        )

                        .findFirst()

                        .orElseThrow(() ->

                                new BadRequestException("Problem does not belong to this contest")

                        );



        Problem problem =

                contestProblem.getProblem();



        // =====================================================

        // GET USER'S CONTEST SUBMISSIONS

        // =====================================================

        List<Submission> submissions =

                submissionRepository

                        .findByContestIdAndUserIdOrderBySubmittedAtDesc(

                                contestId,

                                userId

                        );



        List<ContestSubmissionResponse> results =

                new ArrayList<>();



        for (

                Submission submission

                        : submissions

        ) {



            if (!problemId.equals(

                    submission.getProblemId())) {

                continue;

            }



            String submittedAt =

                    null;



            if (submission.getSubmittedAt()

                    != null) {

                submittedAt =

                        submission

                                .getSubmittedAt()

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



            results.add(

                    response

            );

        }



        return results;

    }

}