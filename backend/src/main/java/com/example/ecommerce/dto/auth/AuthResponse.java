package com.example.ecommerce.dto.auth;

import java.util.Set;

public record AuthResponse(
        String token,
        String tokenType,
        Long userId,
        String fullName,
        String email,
        Set<String> roles
) {}
