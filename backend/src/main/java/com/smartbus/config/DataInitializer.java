package com.smartbus.config;

import com.smartbus.model.Role;
import com.smartbus.model.User;
import com.smartbus.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initializeAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        return args -> {

            String adminEmail = "admin@smartbus.com";

            if (userRepository.existsByEmailIgnoreCase(adminEmail)) {
                return;
            }

            User admin = new User();

            admin.setName("SmartBus Admin");
            admin.setEmail(adminEmail);
            admin.setPhone("9999999999");

            admin.setPassword(
                    passwordEncoder.encode("SmartBusAdmin@2026")
            );

            admin.setRole(Role.ADMIN);

            userRepository.save(admin);

            System.out.println(
                    "========================================"
            );
            System.out.println(
                    "SmartBus development ADMIN created"
            );
            System.out.println(
                    "Email: admin@smartbus.com"
            );
            System.out.println(
                    "Password: SmartBusAdmin@2026"
            );
            System.out.println(
                    "========================================"
            );
        };
    }
}
