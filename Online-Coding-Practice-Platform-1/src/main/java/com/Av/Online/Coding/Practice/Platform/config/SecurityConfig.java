package com.Av.Online.Coding.Practice.Platform.config;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.Av.Online.Coding.Practice.Platform.security.JwtAuthenticationFilter;
import com.Av.Online.Coding.Practice.Platform.security.UserIdentityFilter;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.Av.Online.Coding.Practice.Platform.Repository.UserRepository;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter,
            UserIdentityFilter userIdentityFilter) throws Exception {

        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> {})
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Authentication and public verification/discovery endpoints.
                .requestMatchers("/api/auth/**", "/error").permitAll()
                .requestMatchers(HttpMethod.GET,
                        "/api/problems/**",
                        "/api/contests",
                        "/api/contests/*",
                        "/api/contests/status/**",
                        "/api/leaderboards/**",
                        "/api/certifications",
                        "/api/certifications/*",
                        "/api/certificates/verify/**").permitAll()

                // Assessment candidate links use high-entropy invitation tokens and must work before login.
                .requestMatchers(
                        "/api/assessment-candidates/**",
                        "/api/assessment-candidate-sessions/**",
                        "/api/assessment/security/**").permitAll()

                // Administrator-only surfaces.
                .requestMatchers("/api/admin/**", "/api/assessment-host/admin/**").hasRole("ADMIN")
                // Hidden judge data and admin-only editorial bypass must never be user-readable.
                .requestMatchers(HttpMethod.GET, "/api/test-cases/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/problem-editorials/problem/*").hasRole("ADMIN")
                // Raw submission collection/mutation endpoints are administrative. Normal users
                // submit code through /api/code/submit and read only their own history.
                .requestMatchers(HttpMethod.GET, "/api/submissions").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/submissions").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/submissions/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/contests/*/submissions").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/certificates").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/api/problems/**", "/api/problem-hints/**",
                        "/api/problem-editorials/**", "/api/test-cases/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/problems/**", "/api/problem-hints/**",
                        "/api/problem-editorials/**", "/api/test-cases/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/problems/**", "/api/problem-hints/**",
                        "/api/problem-editorials/**", "/api/test-cases/**").hasRole("ADMIN")

                // Contest administration. User registration/start/run/submit remain authenticated below.
                .requestMatchers(HttpMethod.POST,
                        "/api/contests",
                        "/api/contests/*/publish",
                        "/api/contests/*/cancel",
                        "/api/contests/*/end",
                        "/api/contests/*/problems").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/api/contests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/contests/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/api/contests/*/participants").hasRole("ADMIN")

                // Support administration.
                .requestMatchers("/api/support/admin/**").hasRole("ADMIN")

                // Everything else under the API requires a valid JWT.
                .requestMatchers("/api/**").authenticated()
                .anyRequest().permitAll()
            )
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint((request, response, exception) -> {
                    response.setStatus(401);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"status\":401,\"error\":\"Unauthorized\",\"message\":\"Authentication is required\",\"path\":\""
                            + request.getRequestURI() + "\"}");
                })
                .accessDeniedHandler((request, response, exception) -> {
                    response.setStatus(403);
                    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                    response.getWriter().write("{\"status\":403,\"error\":\"Forbidden\",\"message\":\"You are not authorized to access this resource\",\"path\":\""
                            + request.getRequestURI() + "\"}");
                })
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(userIdentityFilter, JwtAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }
    
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {

        return username -> {
            com.Av.Online.Coding.Practice.Platform.entity.User user =
                    userRepository.findByEmail(username)
                            .orElseThrow(() ->
                                    new UsernameNotFoundException("User not found"));

            return org.springframework.security.core.userdetails.User
                    .withUsername(user.getEmail())
                    .password(user.getPassword())
                    .roles(user.getRole().name())
                    .disabled(!user.isActive())
                    .build();
        };
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource(
            @Value("${app.cors.allowed-origins:http://localhost:5173,http://127.0.0.1:5173}")
            String allowedOrigins) {

        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(
                List.of(allowedOrigins.split(",")).stream().map(String::trim).toList());
        configuration.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
