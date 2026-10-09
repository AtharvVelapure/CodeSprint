package com.Av.Online.Coding.Practice.Platform.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentRepository;
import com.Av.Online.Coding.Practice.Platform.entity.Assessment;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;

    public AssessmentService(AssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    // Create assessment
    public Assessment createAssessment(Assessment assessment) {
        return assessmentRepository.save(assessment);
    }

    // Get all assessments
    public List<Assessment> getAllAssessments() {
        return assessmentRepository.findAll();
    }

    // Get assessment by ID
    public Assessment getAssessmentById(Long id) {

        return assessmentRepository.findById(id)
                .orElse(null);
    }

    // Update assessment
    public Assessment updateAssessment(
            Long id,
            Assessment updatedAssessment) {

        Assessment existingAssessment =
                assessmentRepository.findById(id)
                        .orElse(null);

        if (existingAssessment == null) {
            return null;
        }

        existingAssessment.setTitle(
                updatedAssessment.getTitle()
        );

        existingAssessment.setDescription(
                updatedAssessment.getDescription()
        );

        existingAssessment.setDuration(
                updatedAssessment.getDuration()
        );

        existingAssessment.setDifficulty(
                updatedAssessment.getDifficulty()
        );

        return assessmentRepository.save(existingAssessment);
    }

    // Delete assessment
    public boolean deleteAssessment(Long id) {

        if (!assessmentRepository.existsById(id)) {
            return false;
        }

        assessmentRepository.deleteById(id);

        return true;
    }
}
