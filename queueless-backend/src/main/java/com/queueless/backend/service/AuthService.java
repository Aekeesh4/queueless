package com.queueless.backend.service;

import com.queueless.backend.entity.Role;
import com.queueless.backend.entity.User;
import com.queueless.backend.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.queueless.backend.exception.UnauthorizedException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public User register(
            String name,
            String username,
            String password,
            Role role
    ) {

        if (userRepository.existsByUsername(username)) {
            throw new RuntimeException("Username already exists");
        }

        String encodedPassword =
                passwordEncoder.encode(password);

        User user = new User(
                name,
                username,
                encodedPassword,
                role
        );

        return userRepository.save(user);
    }

    public User login(
            String username,
            String password
    ) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Invalid username or password"
                        )
                );

        if (!passwordEncoder.matches(
                password,
                user.getPassword()
        )) {
            throw new UnauthorizedException(
                    "Invalid username or password"
            );
        }

        return user;
    }

    // Temporary password reset method for development/testing
    public void resetPassword(
            String username,
            String newPassword
    ) {

        User user = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("User not found")
                );

        String encodedPassword =
                passwordEncoder.encode(newPassword);

        user.setPassword(encodedPassword);

        userRepository.save(user);
    }
}