package com.Av.Online.Coding.Practice.Platform.Service;

import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.AssessmentAssignmentRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.ProblemRepository;
import com.Av.Online.Coding.Practice.Platform.Repository.SubmissionRepository;
import com.Av.Online.Coding.Practice.Platform.dto.AdminDashboard;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final ProblemRepository problemRepository;
    private final AssessmentAssignmentRepository assessmentAssignmentRepository;
    private final SubmissionRepository submissionRepository;

    public AdminService(
            UserRepository userRepository,
            ProblemRepository problemRepository,
            AssessmentAssignmentRepository assessmentAssignmentRepository,
            SubmissionRepository submissionRepository) {

        this.userRepository = userRepository;
        this.problemRepository = problemRepository;
        this.assessmentAssignmentRepository = assessmentAssignmentRepository;
        this.submissionRepository = submissionRepository;
    }

    public AdminDashboard getDashboardData() {

        long totalUsers = userRepository.count();

        long totalProblems = problemRepository.count();
        
        long totalAssessments = assessmentAssignmentRepository.countByDeletedFalse();
        
        long totalSubmission = submissionRepository.count();

        return new AdminDashboard(
                totalUsers,
                totalProblems,
                totalAssessments,
                totalSubmission
        );
    }
}