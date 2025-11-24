package com.ehy.service;

import com.ehy.dto.LoginRequest;
import com.ehy.dto.LoginResponse;
import com.ehy.entity.User;
import com.ehy.exception.AuthenticationFailedException;
import com.ehy.repository.UserRepository;
import com.ehy.security.JwtService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service for authentication operations.
 * Handles user login and JWT token generation.
 */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            JwtService jwtService,
            AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    /**
     * Authenticate user and generate JWT token
     * @param request Login request containing username and password
     * @return Login response with JWT token and user information
     * @throws AuthenticationFailedException if credentials are invalid
     */
    public LoginResponse login(LoginRequest request) {
        logger.debug("Login attempt for username: {}", request.getUsername());

        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Get authenticated user
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new AuthenticationFailedException("Invalid credentials"));

            // Generate JWT token
            String token = jwtService.generateToken(user);

            logger.info("User logged in successfully: {}", user.getUsername());

            return LoginResponse.builder()
                    .token(token)
                    .tokenType("Bearer")
                    .userId(user.getId())
                    .username(user.getUsername())
                    .role(user.getRole())
                    .build();

        } catch (AuthenticationException e) {
            logger.warn("Login failed for username: {}", request.getUsername());
            throw new AuthenticationFailedException("Invalid credentials");
        }
    }
}
