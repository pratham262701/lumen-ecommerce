package com.example.ecommerce.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderDto(
        Long id,
        List<OrderItemDto> items,
        BigDecimal total,
        String status,
        String shippingAddress,
        Instant createdAt
) {}
