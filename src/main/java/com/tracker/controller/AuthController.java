package com.tracker.controller;

import com.tracker.model.UserRole;
import com.tracker.service.AuthService;
import com.tracker.service.TrackerContext;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService = TrackerContext.getInstance().getAuthService();

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String password = payload.get("password");
        String roleText = payload.get("role");
        UserRole role = UserRole.valueOf(roleText == null ? "STUDENT" : roleText.trim().toUpperCase());
        return authService.authenticate(email, password, role);
    }
}
