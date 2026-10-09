package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.Contest;
import com.Av.Online.Coding.Practice.Platform.entity.ContestStatus;

public interface ContestRepository
        extends JpaRepository<Contest, Long> {

    List<Contest> findByStatusOrderByStartTimeAsc(
            ContestStatus status
    );

    List<Contest> findAllByOrderByStartTimeDesc();
    
    long countByStatus(ContestStatus status);
}