package com.example.ecommerce.config;

import com.example.ecommerce.model.*;
import com.example.ecommerce.repository.CategoryRepository;
import com.example.ecommerce.repository.ProductRepository;
import com.example.ecommerce.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

/**
 * Seeds demo data on startup if the database is empty.
 *
 * Demo accounts:
 *   admin@shop.test / admin123   (ROLE_ADMIN, ROLE_USER)
 *   user@shop.test  / user123    (ROLE_USER)
 */
@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seed(UserRepository userRepository,
                           CategoryRepository categoryRepository,
                           ProductRepository productRepository,
                           PasswordEncoder encoder) {
        return args -> {
            if (userRepository.count() == 0) {
                userRepository.save(User.builder()
                        .fullName("Site Admin")
                        .email("admin@shop.test")
                        .password(encoder.encode("admin123"))
                        .roles(Set.of(Role.ROLE_ADMIN, Role.ROLE_USER))
                        .build());
                userRepository.save(User.builder()
                        .fullName("Demo User")
                        .email("user@shop.test")
                        .password(encoder.encode("user123"))
                        .roles(Set.of(Role.ROLE_USER))
                        .build());
            }

            if (categoryRepository.count() == 0) {
                Category electronics = categoryRepository.save(
                        Category.builder().name("Electronics").description("Gadgets and devices").build());
                Category books = categoryRepository.save(
                        Category.builder().name("Books").description("Paperbacks and hardcovers").build());
                Category home = categoryRepository.save(
                        Category.builder().name("Home & Kitchen").description("Everyday essentials").build());

                productRepository.saveAll(List.of(
                    Product.builder().name("Wireless Headphones")
                        .description("Over-ear Bluetooth headphones with active noise cancellation.")
                        .price(new BigDecimal("129.99")).stock(40)
                        .imageUrl("https://picsum.photos/seed/headphones/600/400")
                        .category(electronics).build(),
                    Product.builder().name("Mechanical Keyboard")
                        .description("Hot-swappable RGB mechanical keyboard with tactile switches.")
                        .price(new BigDecimal("89.50")).stock(60)
                        .imageUrl("https://picsum.photos/seed/keyboard/600/400")
                        .category(electronics).build(),
                    Product.builder().name("4K Monitor 27\"")
                        .description("27-inch UHD IPS display with USB-C and HDR support.")
                        .price(new BigDecimal("329.00")).stock(15)
                        .imageUrl("https://picsum.photos/seed/monitor/600/400")
                        .category(electronics).build(),
                    Product.builder().name("Clean Code")
                        .description("A Handbook of Agile Software Craftsmanship by Robert C. Martin.")
                        .price(new BigDecimal("34.99")).stock(100)
                        .imageUrl("https://picsum.photos/seed/cleancode/600/400")
                        .category(books).build(),
                    Product.builder().name("The Pragmatic Programmer")
                        .description("Your Journey to Mastery, 20th Anniversary Edition.")
                        .price(new BigDecimal("39.99")).stock(80)
                        .imageUrl("https://picsum.photos/seed/pragmatic/600/400")
                        .category(books).build(),
                    Product.builder().name("Stainless Steel Cookware Set")
                        .description("10-piece induction-ready cookware set with glass lids.")
                        .price(new BigDecimal("199.99")).stock(25)
                        .imageUrl("https://picsum.photos/seed/cookware/600/400")
                        .category(home).build(),
                    Product.builder().name("Espresso Machine")
                        .description("15-bar pump espresso machine with milk frother.")
                        .price(new BigDecimal("249.00")).stock(18)
                        .imageUrl("https://picsum.photos/seed/espresso/600/400")
                        .category(home).build(),
                    Product.builder().name("Smart LED Bulb (4-pack)")
                        .description("Wi-Fi color-changing bulbs, works with major voice assistants.")
                        .price(new BigDecimal("44.99")).stock(120)
                        .imageUrl("https://picsum.photos/seed/bulb/600/400")
                        .category(home).build()
                ));
            }
        };
    }
}
