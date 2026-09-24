package com.department.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "Department Management System Backend is running successfully!";
    }

    @GetMapping("/api/health")
    public String health() {
        return "Backend is healthy!";
    }
}