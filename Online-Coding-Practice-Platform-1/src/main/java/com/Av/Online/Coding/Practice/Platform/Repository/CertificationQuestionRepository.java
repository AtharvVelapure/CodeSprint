package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.Certification;
import com.Av.Online.Coding.Practice.Platform.entity.CertificationQuestion;
import com.Av.Online.Coding.Practice.Platform.entity.Problem;

public interface CertificationQuestionRepository
        extends JpaRepository<CertificationQuestion, Long> {

    // ============================================================
    // GET QUESTIONS FOR A CERTIFICATION
    // ============================================================

    List<CertificationQuestion>
    findByCertificationOrderByQuestionOrderAsc(
            Certification certification);


    // ============================================================
    // CHECK WHETHER PROBLEM IS ALREADY USED IN CERTIFICATION
    // ============================================================

    boolean existsByCertificationAndProblem(
            Certification certification,
            Problem problem);


    // ============================================================
    // CHECK WHETHER PROBLEM IS USED BY ANY CERTIFICATION
    // ============================================================

    boolean existsByProblem_Id(Long problemId);


    // ============================================================
    // CHECK WHETHER QUESTION ORDER IS ALREADY USED
    // ============================================================

    boolean existsByCertificationAndQuestionOrder(
            Certification certification,
            Integer questionOrder);


    // ============================================================
    // DELETE ALL QUESTIONS OF A CERTIFICATION
    // ============================================================

    void deleteByCertification(
            Certification certification);


    // ============================================================
    // COUNT QUESTIONS OF A CERTIFICATION
    // ============================================================

    long countByCertificationId(Long certificationId);
}