package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.CertificationQuestionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ContestProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemEditorialRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemHintRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.TestCaseRepository;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.exception.ConflictException;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemDeleteResponse;

@Service
public class ProblemService {

    private final ProblemRepository problemRepository;

    private final AssessmentAssignmentProblemRepository
            assessmentAssignmentProblemRepository;

    private final ContestProblemRepository
            contestProblemRepository;

    private final CertificationQuestionRepository
            certificationQuestionRepository;

    private final SubmissionRepository
            submissionRepository;

    private final TestCaseRepository
            testCaseRepository;

    private final ProblemHintRepository
            problemHintRepository;

    private final ProblemEditorialRepository
            problemEditorialRepository;


    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    public ProblemService(
            ProblemRepository problemRepository,
            AssessmentAssignmentProblemRepository assessmentAssignmentProblemRepository,
            ContestProblemRepository contestProblemRepository,
            CertificationQuestionRepository certificationQuestionRepository,
            SubmissionRepository submissionRepository,
            TestCaseRepository testCaseRepository,
            ProblemHintRepository problemHintRepository,
            ProblemEditorialRepository problemEditorialRepository) {

        this.problemRepository = problemRepository;

        this.assessmentAssignmentProblemRepository =
                assessmentAssignmentProblemRepository;

        this.contestProblemRepository =
                contestProblemRepository;

        this.certificationQuestionRepository =
                certificationQuestionRepository;

        this.submissionRepository =
                submissionRepository;

        this.testCaseRepository =
                testCaseRepository;

        this.problemHintRepository =
                problemHintRepository;

        this.problemEditorialRepository =
                problemEditorialRepository;
    }


    // ============================================================
    // GET ALL ACTIVE NORMAL PROBLEMS
    // ============================================================

    public List<ProblemResponse> getAllProblems() {

        return problemRepository
                .findBySourceAndActive("NORMAL", true)
                .stream()
                .map(ProblemResponse::new)
                .toList();
    }


    // ============================================================
    // GET ACTIVE NORMAL PROBLEMS BY CATEGORY
    // ============================================================

    public List<ProblemResponse> getProblemsByCategory(
            String category) {

        return problemRepository
                .findBySourceAndCategoryAndActive(
                        "NORMAL",
                        category,
                        true
                )
                .stream()
                .map(ProblemResponse::new)
                .toList();
    }


    // ============================================================
    // GET ACTIVE NORMAL PROBLEMS BY DIFFICULTY
    // ============================================================

    public List<ProblemResponse> getProblemsByDifficulty(
            String difficulty) {

        return problemRepository
                .findBySourceAndDifficultyAndActive(
                        "NORMAL",
                        difficulty,
                        true
                )
                .stream()
                .map(ProblemResponse::new)
                .toList();
    }


    // ============================================================
    // CREATE NORMAL PROBLEM
    // ============================================================

    public ProblemResponse addProblem(Problem problem) {

        /*
         * Problems created through normal Problem Management
         * are always NORMAL.
         */
        problem.setSource("NORMAL");

        /*
         * Every newly created problem is active.
         */
        problem.setActive(true);

        Problem savedProblem =
                problemRepository.save(problem);

        return new ProblemResponse(savedProblem);
    }


 // ============================================================
 // DELETE PROBLEM
 // ============================================================

 @Transactional
 public ProblemDeleteResponse deleteProblem(Long id) {

     /*
      * First load the problem.
      */
     Problem problem =
             problemRepository
                     .findById(id)
                     .orElseThrow(() ->
                             new ResourceNotFoundException(
                                     "Problem not found"
                             )
                     );


     /*
      * Problem Management is only responsible for
      * NORMAL problems.
      */
     if (!"NORMAL".equals(problem.getSource())) {

         throw new ResourceNotFoundException(
                 "Problem not found"
         );
     }


     // ========================================================
     // BLOCK: ASSESSMENT
     // ========================================================

     if (assessmentAssignmentProblemRepository
             .existsByProblem_Id(id)) {

         return new ProblemDeleteResponse(
                 false,
                 true,
                 "Cannot permanently delete this problem because it is currently used in an assessment. Deactivate the problem instead."
         );
     }


     // ========================================================
     // BLOCK: CONTEST
     // ========================================================

     if (contestProblemRepository
             .existsByProblem_Id(id)) {

         return new ProblemDeleteResponse(
                 false,
                 true,
                 "Cannot permanently delete this problem because it is currently used in a contest. Deactivate the problem instead."
         );
     }


     // ========================================================
     // BLOCK: CERTIFICATION
     // ========================================================

     if (certificationQuestionRepository
             .existsByProblem_Id(id)) {

         return new ProblemDeleteResponse(
                 false,
                 true,
                 "Cannot permanently delete this problem because it is currently used in a certification. Deactivate the problem instead."
         );
     }


     // ========================================================
     // BLOCK: SUBMISSION HISTORY
     // ========================================================

     /*
      * Never permanently delete a problem that has
      * submission history.
      *
      * Use deactivateProblem() instead.
      */
     if (submissionRepository
             .existsByProblemId(id)) {

         return new ProblemDeleteResponse(
                 false,
                 true,
                 "Cannot permanently delete this problem because submission history exists. Deactivate the problem instead."
         );
     }


     // ========================================================
     // SAFE CLEANUP
     // ========================================================

     /*
      * At this point the problem is not being used by:
      *
      * - Assessment
      * - Contest
      * - Certification
      * - Submission history
      *
      * Therefore permanent deletion is safe.
      */

     testCaseRepository
             .deleteByProblem_Id(id);

     problemHintRepository
             .deleteByProblem_Id(id);

     problemEditorialRepository
             .deleteByProblem_Id(id);


     // ========================================================
     // DELETE PROBLEM
     // ========================================================

     problemRepository.delete(problem);


     return new ProblemDeleteResponse(
             true,
             false,
             "Problem deleted successfully"
     );
 }


    // ============================================================
    // DEACTIVATE PROBLEM
    // ============================================================

    @Transactional
    public String deactivateProblem(Long id) {

        Problem problem =
                problemRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Problem not found"
                                )
                        );


        /*
         * Only NORMAL problems can be managed here.
         */
        if (!"NORMAL".equals(problem.getSource())) {

            throw new ResourceNotFoundException(
                    "Problem not found"
            );
        }


        if (!problem.isActive()) {

            return "Problem is already inactive";
        }


        problem.setActive(false);

        problemRepository.save(problem);

        return "Problem deactivated successfully";
    }


    // ============================================================
    // ACTIVATE PROBLEM
    // ============================================================

    @Transactional
    public String activateProblem(Long id) {

        Problem problem =
                problemRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Problem not found"
                                )
                        );


        /*
         * Only NORMAL problems can be managed here.
         */
        if (!"NORMAL".equals(problem.getSource())) {

            throw new ResourceNotFoundException(
                    "Problem not found"
            );
        }


        if (problem.isActive()) {

            return "Problem is already active";
        }


        problem.setActive(true);

        problemRepository.save(problem);

        return "Problem activated successfully";
    }


    // ============================================================
    // GET PROBLEM BY ID
    // ============================================================

    public ProblemResponse getProblemById(Long id) {

        Problem problem =
                problemRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Problem not found"
                                )
                        );


        /*
         * Normal Problem Management should not expose
         * certification-only problems.
         *
         * We intentionally do not block inactive problems
         * here because Admin Problem Management may need
         * to open an inactive problem.
         */
        if (!"NORMAL".equals(problem.getSource())) {

            throw new ResourceNotFoundException(
                    "Problem not found"
            );
        }


        return new ProblemResponse(problem);
    }


    // ============================================================
    // UPDATE PROBLEM
    // ============================================================

    public ProblemResponse updateProblem(
            Long id,
            Problem updatedProblem) {

        Problem existingProblem =
                problemRepository
                        .findById(id)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Problem not found"
                                )
                        );


        /*
         * Do not allow normal Problem Management to convert
         * a problem into a certification-only problem.
         */
        if (!"NORMAL".equals(existingProblem.getSource())) {

            throw new ResourceNotFoundException(
                    "Problem not found"
            );
        }


        existingProblem.setTitle(
                updatedProblem.getTitle()
        );

        existingProblem.setDescription(
                updatedProblem.getDescription()
        );

        existingProblem.setDifficulty(
                updatedProblem.getDifficulty()
        );

        existingProblem.setCategory(
                updatedProblem.getCategory()
        );

        existingProblem.setInputFormat(
                updatedProblem.getInputFormat()
        );

        existingProblem.setOutputFormat(
                updatedProblem.getOutputFormat()
        );

        existingProblem.setConstraints(
                updatedProblem.getConstraints()
        );


        /*
         * Always remain NORMAL.
         */
        existingProblem.setSource("NORMAL");


        /*
         * Do NOT overwrite active status here.
         *
         * The active/inactive state is controlled
         * separately through activate/deactivate endpoints.
         */


        Problem savedProblem =
                problemRepository.save(existingProblem);

        return new ProblemResponse(savedProblem);
    }


    // ============================================================
    // ALL CATEGORIES
    // ============================================================

    public List<String> getCategories() {

        return problemRepository
                .findDistinctCategories();
    }


    // ============================================================
    // ALL DIFFICULTIES
    // ============================================================

    public List<String> getDifficulties() {

        return problemRepository
                .findDistinctDifficulties();
    }
    
    public List<ProblemResponse> getAllProblemsForAdmin() {
        return problemRepository.findBySource("NORMAL")
                .stream()
                .map(ProblemResponse::new)
                .collect(Collectors.toList());
    }
}