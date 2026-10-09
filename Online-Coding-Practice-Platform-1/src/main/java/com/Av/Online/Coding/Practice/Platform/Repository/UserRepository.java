package com.Av.Online.Coding.Practice.Platform.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.Av.Online.Coding.Practice.Platform.entity.Role;
import com.Av.Online.Coding.Practice.Platform.entity.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByActive(boolean active);

    @Query("""
        SELECT u
        FROM User u
        WHERE u.active = true
        AND (
            LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))
        )
        ORDER BY u.name ASC
    """)
    List<User> searchActiveUsers(
            @Param("search") String search
    );
    
    long countByActive(boolean active);
    
    long countByRole(Role role);
    
    long countByActiveAndRole(boolean active, Role role);
}