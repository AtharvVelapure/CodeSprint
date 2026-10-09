package com.Av.Online.Coding.Practice.Platform.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.ProblemHintService;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemHintResponse;
import com.Av.Online.Coding.Practice.Platform.entity.ProblemHint;

@RestController
@RequestMapping("/api/problem-hints")
public class ProblemHintController {

    private final ProblemHintService hintService;

    public ProblemHintController(ProblemHintService hintService) {
        this.hintService = hintService;
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<List<ProblemHintResponse>> getHintsByProblem(@PathVariable Long problemId) {
        return ResponseEntity.ok(hintService.getHintsByProblem(problemId));
    }

    @PostMapping("/problem/{problemId}")
    public ResponseEntity<ProblemHintResponse> addHint(@PathVariable Long problemId, @RequestBody ProblemHint hint) {
        return ResponseEntity.ok(hintService.addHint(problemId, hint));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProblemHintResponse> updateHint(@PathVariable Long id, @RequestBody ProblemHint updatedHint) {
        return ResponseEntity.ok(hintService.updateHint(id, updatedHint));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHint(@PathVariable Long id) {
        hintService.deleteHint(id);
        return ResponseEntity.ok("Hint deleted successfully");
    }
}
