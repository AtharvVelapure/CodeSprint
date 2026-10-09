package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemEditorialRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.dto.EditorialAccessResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemEditorialResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.ProblemEditorial;
import com.Av.Online.Coding.Practice.Platform.entity.Submission;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class ProblemEditorialService {

    private static final int REQUIRED_ATTEMPTS = 3;

    private final ProblemEditorialRepository editorialRepository;
    private final ProblemRepository problemRepository;
    private final SubmissionRepository submissionRepository;

    public ProblemEditorialService(ProblemEditorialRepository editorialRepository,
                                   ProblemRepository problemRepository,
                                   SubmissionRepository submissionRepository) {
        this.editorialRepository = editorialRepository;
        this.problemRepository = problemRepository;
        this.submissionRepository = submissionRepository;
    }

    public ProblemEditorialResponse getEditorialByProblem(Long problemId) {

        if (!problemRepository.existsById(problemId)) {
            throw new ResourceNotFoundException("Problem not found");
        }

        ProblemEditorial editorial =
                editorialRepository.findByProblemId(problemId)
                        .orElse(null);

        if (editorial == null) {
            return null;
        }

        return toResponse(editorial, problemId);
    }

    public ProblemEditorialResponse saveEditorial(Long problemId, ProblemEditorial editorial) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));

        ProblemEditorial existingEditorial = editorialRepository.findByProblemId(problemId).orElse(null);
        ProblemEditorial saved;

        if (existingEditorial != null) {
            existingEditorial.setApproach(editorial.getApproach());
            existingEditorial.setAlgorithm(editorial.getAlgorithm());
            existingEditorial.setExplanation(editorial.getExplanation());
            existingEditorial.setTimeComplexity(editorial.getTimeComplexity());
            existingEditorial.setSpaceComplexity(editorial.getSpaceComplexity());
            saved = editorialRepository.save(existingEditorial);
        } else {
            editorial.setProblem(problem);
            saved = editorialRepository.save(editorial);
        }

        return toResponse(saved, problemId);
    }

    public void deleteEditorial(Long id) {
        if (!editorialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Editorial not found");
        }
        editorialRepository.deleteById(id);
    }

    public EditorialAccessResponse getEditorialAccess(Long problemId, Long userId) {
        List<Submission> submissions = submissionRepository
                .findByUserIdAndProblemIdOrderBySubmittedAtDesc(userId, problemId);

        long unsuccessfulAttempts = submissions.stream()
                .filter(s -> !isSuccessful(s.getStatus()))
                .count();

        boolean unlocked = unsuccessfulAttempts >= REQUIRED_ATTEMPTS;
        ProblemEditorialResponse editorial = null;

        if (unlocked) {
            ProblemEditorial entity = editorialRepository.findByProblemId(problemId).orElse(null);
            if (entity != null) {
                editorial = toResponse(entity, problemId);
            }
        }

        return new EditorialAccessResponse(unlocked, unsuccessfulAttempts, REQUIRED_ATTEMPTS, editorial);
    }

    private ProblemEditorialResponse toResponse(ProblemEditorial editorial, Long problemId) {
        return new ProblemEditorialResponse(
                editorial.getId(),
                problemId,
                editorial.getApproach(),
                editorial.getAlgorithm(),
                editorial.getExplanation(),
                editorial.getTimeComplexity(),
                editorial.getSpaceComplexity()
        );
    }

    private boolean isSuccessful(String status) {
        if (status == null) {
            return false;
        }
        String normalized = status.toLowerCase().trim();
        return normalized.equals("accepted") || normalized.equals("success");
    }
}
