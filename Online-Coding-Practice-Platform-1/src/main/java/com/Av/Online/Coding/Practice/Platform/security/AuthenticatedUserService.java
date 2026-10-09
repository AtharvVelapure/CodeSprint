package com.Av.Online.Coding.Practice.Platform.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.Av.Online.Coding.Practice.Platform.entity.Role;
import com.Av.Online.Coding.Practice.Platform.entity.User;
import com.Av.Online.Coding.Practice.Platform.exception.ForbiddenException;

@Service
public class AuthenticatedUserService {

    public User currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User user)) {
            throw new ForbiddenException("Authentication is required");
        }
        return user;
    }

    public Long currentUserId() {
        return currentUser().getId();
    }

    public void requireSelfOrAdmin(Long requestedUserId) {
        User current = currentUser();
        if (current.getRole() != Role.ADMIN && !current.getId().equals(requestedUserId)) {
            throw new ForbiddenException("You are not authorized to access another user's data");
        }
    }
}
