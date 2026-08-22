package com.queueless.backend.controller;

import com.queueless.backend.dto.LoginRequest;
import com.queueless.backend.dto.LoginResponse;
import com.queueless.backend.dto.UserResponse;
import com.queueless.backend.entity.Role;
import com.queueless.backend.entity.User;
import com.queueless.backend.service.AuthService;
import com.queueless.backend.service.JwtService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;

    public AuthController(
            AuthService authService,
            JwtService jwtService
    ) {
        this.authService = authService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public UserResponse register(
            @RequestParam String name,
            @RequestParam String username,
            @RequestParam String password
    ) {

        User user = authService.register(
                name,
                username,
                password,
                Role.CUSTOMER
        );

        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getRole()
        );
    }

    @PostMapping("/login")
    public LoginResponse login(
            @RequestBody LoginRequest request
    ) {

        User user = authService.login(
                request.getUsername(),
                request.getPassword()
        );

        String token =
                jwtService.generateToken(user);

        return new LoginResponse(
                "Login successful",
                token,
                user.getId(),
                user.getName(),
                user.getUsername(),
                user.getRole()
        );
    }
    @PutMapping("/reset-password")
    public String resetPassword(
            @RequestParam String username,
            @RequestParam String newPassword
    ) {
        authService.resetPassword(username, newPassword);
        return "Password reset successful";
    }
}