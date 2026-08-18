package com.queueless.backend.dto;

import com.queueless.backend.entity.Role;

public class UserResponse {

    private Long id;
    private String name;
    private String username;
    private Role role;

    public UserResponse() {
    }

    public UserResponse(
            Long id,
            String name,
            String username,
            Role role
    ) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.role = role;
    }

    public Long getId() {
        return id;
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