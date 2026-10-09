
package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.Av.Online.Coding.Practice.Platform.entity.Contest;
import com.Av.Online.Coding.Practice.Platform.entity.ContestParticipant;
import com.Av.Online.Coding.Practice.Platform.entity.User;

	public interface ContestParticipantRepository
	        extends JpaRepository<ContestParticipant, Long> {

	    Optional<ContestParticipant> findByContestAndUser(
	            Contest contest,
	            User user
	    );

	    List<ContestParticipant> findByContestOrderByScoreDesc(
	            Contest contest
	    );

	    List<ContestParticipant> findByUserOrderByRegisteredAtDesc(
	            User user
	    );

	    boolean existsByContestAndUser(
	            Contest contest,
	            User user
	    );

	    void deleteByContest(Contest contest);
	}

