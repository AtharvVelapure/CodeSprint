package com.Av.Online.Coding.Practice.Platform.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.Av.Online.Coding.Practice.Platform.Service.ProblemEditorialService;
import com.Av.Online.Coding.Practice.Platform.dto.EditorialAccessResponse;
import com.Av.Online.Coding.Practice.Platform.dto.ProblemEditorialResponse;
import com.Av.Online.Coding.Practice.Platform.entity.ProblemEditorial;

@RestController
@RequestMapping("/api/problem-editorials")
public class ProblemEditorialController {

    private final ProblemEditorialService editorialService;

    public ProblemEditorialController(ProblemEditorialService editorialService) {
        this.editorialService = editorialService;
    }

    @GetMapping("/problem/{problemId}")
    public ResponseEntity<ProblemEditorialResponse> getEditorial(
            @PathVariable Long problemId) {

        ProblemEditorialResponse editorial =
                editorialService.getEditorialByProblem(problemId);

        if (editorial == null) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(editorial);
    }

    @GetMapping("/problem/{problemId}/user/{userId}")
    public ResponseEntity<EditorialAccessResponse> getEditorialAccess(
            @PathVariable Long problemId,
            @PathVariable Long userId) {
        return ResponseEntity.ok(editorialService.getEditorialAccess(problemId, userId));
    }

    @PostMapping("/problem/{problemId}")
    public ResponseEntity<ProblemEditorialResponse> saveEditorial(
            @PathVariable Long problemId,
            @RequestBody ProblemEditorial editorial) {
        return ResponseEntity.ok(editorialService.saveEditorial(problemId, editorial));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEditorial(@PathVariable Long id) {
        editorialService.deleteEditorial(id);
        return ResponseEntity.ok("Editorial deleted successfully");
    }
}
