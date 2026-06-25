package com.example.ecommerce.controller;

import com.example.ecommerce.dto.AddToCartRequest;
import com.example.ecommerce.dto.CartDto;
import com.example.ecommerce.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    public CartDto get() {
        return cartService.getCart();
    }

    @PostMapping("/items")
    public CartDto add(@Valid @RequestBody AddToCartRequest request) {
        return cartService.addToCart(request);
    }

    @PutMapping("/items/{itemId}")
    public CartDto update(@PathVariable Long itemId, @RequestBody Map<String, Integer> body) {
        int quantity = body.getOrDefault("quantity", 1);
        return cartService.updateQuantity(itemId, quantity);
    }

    @DeleteMapping("/items/{itemId}")
    public CartDto remove(@PathVariable Long itemId) {
        return cartService.removeItem(itemId);
    }

    @DeleteMapping
    public ResponseEntity<Void> clear() {
        cartService.clearCart();
        return ResponseEntity.noContent().build();
    }
}
