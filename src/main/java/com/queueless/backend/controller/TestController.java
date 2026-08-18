package com.queueless.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TestController {

    @GetMapping("/api/test")
    public String test() {
        return "QueueLess backend is running!";
    }

    @GetMapping("/api/test/staff")
    @PreAuthorize("hasRole('STAFF')")
    public String staffTest() {
        return "Staff access granted!";
    }
}