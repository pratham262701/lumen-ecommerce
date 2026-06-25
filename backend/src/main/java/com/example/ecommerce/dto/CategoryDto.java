package com.example.ecommerce.dto;

import jakarta.validation.constraints.NotBlank;

public record CategoryDto(
        Long id,
        @NotBlank String name,
        String description
) {}
