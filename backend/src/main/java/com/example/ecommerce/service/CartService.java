package com.example.ecommerce.service;

import com.example.ecommerce.dto.AddToCartRequest;
import com.example.ecommerce.dto.CartDto;
import com.example.ecommerce.dto.CartItemDto;
import com.example.ecommerce.exception.BadRequestException;
import com.example.ecommerce.exception.ResourceNotFoundException;
import com.example.ecommerce.model.CartItem;
import com.example.ecommerce.model.Product;
import com.example.ecommerce.model.User;
import com.example.ecommerce.repository.CartItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductService productService;
    private final CurrentUserService currentUserService;

    public CartService(CartItemRepository cartItemRepository,
                       ProductService productService,
                       CurrentUserService currentUserService) {
        this.cartItemRepository = cartItemRepository;
        this.productService = productService;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public CartDto getCart() {
        User user = currentUserService.get();
        return toCartDto(cartItemRepository.findByUserId(user.getId()));
    }

    @Transactional
    public CartDto addToCart(AddToCartRequest request) {
        User user = currentUserService.get();
        Product product = productService.getEntity(request.productId());

        CartItem item = cartItemRepository
                .findByUserIdAndProductId(user.getId(), product.getId())
                .orElse(CartItem.builder().user(user).product(product).quantity(0).build());

        int newQty = item.getQuantity() + request.quantity();
        if (newQty > product.getStock()) {
            throw new BadRequestException("Not enough stock for product: " + product.getName());
        }
        item.setQuantity(newQty);
        cartItemRepository.save(item);

        return toCartDto(cartItemRepository.findByUserId(user.getId()));
    }

    @Transactional
    public CartDto updateQuantity(Long itemId, int quantity) {
        User user = currentUserService.get();
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));
        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to current user");
        }
        if (quantity <= 0) {
            cartItemRepository.delete(item);
        } else {
            if (quantity > item.getProduct().getStock()) {
                throw new BadRequestException("Not enough stock");
            }
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return toCartDto(cartItemRepository.findByUserId(user.getId()));
    }

    @Transactional
    public CartDto removeItem(Long itemId) {
        User user = currentUserService.get();
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found: " + itemId));
        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Cart item does not belong to current user");
        }
        cartItemRepository.delete(item);
        return toCartDto(cartItemRepository.findByUserId(user.getId()));
    }

    @Transactional
    public void clearCart() {
        User user = currentUserService.get();
        cartItemRepository.deleteByUserId(user.getId());
    }

    private CartDto toCartDto(List<CartItem> items) {
        List<CartItemDto> dtos = items.stream().map(i -> {
            BigDecimal unit = i.getProduct().getPrice();
            BigDecimal lineTotal = unit.multiply(BigDecimal.valueOf(i.getQuantity()));
            return new CartItemDto(i.getId(), i.getProduct().getId(), i.getProduct().getName(),
                    i.getProduct().getImageUrl(), unit, i.getQuantity(), lineTotal);
        }).toList();
        BigDecimal total = dtos.stream().map(CartItemDto::lineTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return new CartDto(dtos, total);
    }
}
