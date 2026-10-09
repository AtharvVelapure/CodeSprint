package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.ProblemHintRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemHintResponse;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;
import com.Av.Online.Coding.Practice.Platform.entity.ProblemHint;
import com.Av.Online.Coding.Practice.Platform.exception.ResourceNotFoundException;

@Service
public class ProblemHintService {

    private final ProblemHintRepository problemHintRepository;
    private final ProblemRepository problemRepository;

    public ProblemHintService(ProblemHintRepository problemHintRepository, ProblemRepository problemRepository) {
        this.problemHintRepository = problemHintRepository;
        this.problemRepository = problemRepository;
    }

    public List<ProblemHintResponse> getHintsByProblem(Long problemId) {
        return problemHintRepository.findByProblemIdOrderByHintOrderAsc(problemId)
                .stream()
                .map(hint -> toResponse(hint, problemId))
                .toList();
    }

    public ProblemHintResponse addHint(Long problemId, ProblemHint hint) {
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ResourceNotFoundException("Problem not found"));
        hint.setProblem(problem);
        ProblemHint saved = problemHintRepository.save(hint);
        return toResponse(saved, problemId);
    }

    public ProblemHintResponse updateHint(Long id, ProblemHint updatedHint) {
        ProblemHint existingHint = problemHintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hint not found"));
        existingHint.setHintOrder(updatedHint.getHintOrder());
        existingHint.setHintText(updatedHint.getHintText());
        ProblemHint saved = problemHintRepository.save(existingHint);
        return toResponse(saved, saved.getProblem().getId());
    }

    public void deleteHint(Long id) {
        if (!problemHintRepository.existsById(id)) {
            throw new ResourceNotFoundException("Hint not found");
        }
        problemHintRepository.deleteById(id);
    }

    private ProblemHintResponse toResponse(ProblemHint hint, Long problemId) {
        return new ProblemHintResponse(hint.getId(), problemId, hint.getHintOrder(), hint.getHintText());
    }
}
