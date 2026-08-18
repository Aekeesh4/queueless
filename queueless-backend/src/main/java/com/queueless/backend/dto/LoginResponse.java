package com.queueless.backend.dto;

import com.queueless.backend.entity.Role;

public class LoginResponse {

    private String message;
    private String token;
    private Long userId;
    private String name;
    private String username;
    private Role role;

    public LoginResponse(
            String message,
            String token,
            Long userId,
            String name,
            String username,
            Role role
    ) {
        this.message = message;
        this.token = token;
        this.userId = userId;
        this.name = name;
        this.username = username;
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public String getToken() {
        return token;
    }

    public Long getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public String getUsername() {
        return username;
    }

    public Role getRole() {
        return role;
    }
}