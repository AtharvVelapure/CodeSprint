package com.Av.Online.Coding.Practice.Platform.security;

import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.Av.Online.Coding.Practice.Platform.entity.Role;
import com.Av.Online.Coding.Practice.Platform.entity.User;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class UserIdentityFilter extends OncePerRequestFilter {

    private static final Pattern ASSESSMENT_INVITATION_TARGET =
            Pattern.compile("^/api/assessment-invitations/\\d+/users/\\d+/?$");

    private static final Pattern[] USER_ID_PATHS = {
            Pattern.compile("/user/(\\d+)(?:/|$)"),
            Pattern.compile("/users/(\\d+)(?:/|$)"),
            Pattern.compile("/verification/(\\d+)(?:/|$)")
    };

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof User user
                && user.getRole() != Role.ADMIN) {

            Long requestedId = parseLong(request.getParameter("userId"));
            if (requestedId != null && !user.getId().equals(requestedId)) {
                forbidden(response, request);
                return;
            }

            String uri = request.getRequestURI();

            // In this endpoint /users/{candidateUserId} is the invitation target,
            // not the authenticated actor. The actor is still validated through
            // the userId query parameter above.
            boolean invitationTargetPath = ASSESSMENT_INVITATION_TARGET.matcher(uri).matches();

            if (!invitationTargetPath) {
                for (Pattern pattern : USER_ID_PATHS) {
                Matcher matcher = pattern.matcher(uri);
                if (matcher.find()) {
                    Long pathUserId = Long.valueOf(matcher.group(1));
                    if (!user.getId().equals(pathUserId)) {
                        forbidden(response, request);
                        return;
                    }
                }
            }
            }
        }

        filterChain.doFilter(request, response);
    }

    private Long parseLong(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Long.valueOf(value);
        } catch (NumberFormatException exception) {
            return null;
        }
    }

    private void forbidden(HttpServletResponse response, HttpServletRequest request)
            throws IOException {
        response.setStatus(403);
        response.setContentType("application/json");
        response.getWriter().write(
                "{\"status\":403,\"error\":\"Forbidden\",\"message\":\"You are not authorized to act as another user\",\"path\":\""
                        + request.getRequestURI() + "\"}");
    }
}
