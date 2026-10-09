package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.Certification;

public interface CertificationRepository
        extends JpaRepository<Certification, Long> {

    List<Certification> findByStatusOrderByTitleAsc(String status);

    List<Certification> findAllByOrderByTitleAsc();
    
    
}