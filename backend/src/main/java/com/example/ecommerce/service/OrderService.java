package com.example.ecommerce.service;

import com.example.ecommerce.dto.CheckoutRequest;
import com.example.ecommerce.dto.OrderDto;
import com.example.ecommerce.dto.OrderItemDto;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.CartItemRepository;
import com.example.ecommerce.repository.OrderRepository;
import com.example.ecommerce.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CurrentUserService currentUserService;

    public OrderService(OrderRepository orderRepository,
                        CartItemRepository cartItemRepository,
                        ProductRepository productRepository,
                        CurrentUserService currentUserService) {
        this.orderRepository = orderRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional
    public OrderDto checkout(CheckoutRequest request) {
        User user = currentUserService.get();
        List<CartItem> cartItems = cartItemRepository.findByUserId(user.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PAID)
                .shippingAddress(request.shippingAddress())
                .total(BigDecimal.ZERO)
                .build();

        BigDecimal total = BigDecimal.ZERO;
        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            if (ci.getQuantity() > product.getStock()) {
                throw new BadRequestException("Not enough stock for " + product.getName());
            }
            // decrement stock
            product.setStock(product.getStock() - ci.getQuantity());
            productRepository.save(product);

            OrderItem oi = OrderItem.builder()
                    .product(product)
                    .productName(product.getName())
                    .unitPrice(product.getPrice())
                    .quantity(ci.getQuantity())
                    .build();
            order.addItem(oi);
            total = total.add(product.getPrice().multiply(BigDecimal.valueOf(ci.getQuantity())));
        }
        order.setTotal(total);

        Order saved = orderRepository.save(order);
        cartItemRepository.deleteByUserId(user.getId());
        return toDto(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderDto> myOrders() {
        User user = currentUserService.get();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public OrderDto getById(Long id) {
        User user = currentUserService.get();
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));
        boolean isOwner = order.getUser().getId().equals(user.getId());
        boolean isAdmin = user.getRoles().contains(Role.ROLE_ADMIN);
        if (!isOwner && !isAdmin) {
            throw new BadRequestException("You do not have access to this order");
        }
        return toDto(order);
    }

    private OrderDto toDto(Order order) {
        List<OrderItemDto> items = order.getItems().stream().map(i ->
                new OrderItemDto(
                        i.getProduct() != null ? i.getProduct().getId() : null,
                        i.getProductName(),
                        i.getUnitPrice(),
                        i.getQuantity(),
                        i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity()))
                )).toList();
        return new OrderDto(order.getId(), items, order.getTotal(),
                order.getStatus().name(), order.getShippingAddress(), order.getCreatedAt());
    }
}
