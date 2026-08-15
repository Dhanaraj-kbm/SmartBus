package com.smartbus.service;

import com.smartbus.dto.AuthResponse;
import com.smartbus.dto.LoginRequest;
import com.smartbus.dto.RegisterRequest;
import com.smartbus.model.Role;
import com.smartbus.model.User;
import com.smartbus.repository.UserRepository;
import com.smartbus.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public AuthResponse register(
        RegisterRequest request
    ) {

        String email =
            request.email().trim().toLowerCase();

        if (userRepository.existsByEmailIgnoreCase(email)) {

            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "An account with this email already exists"
            );
        }

        User user = new User();

        user.setName(request.name().trim());
        user.setEmail(email);

        if (request.phone() != null) {
            user.setPhone(request.phone().trim());
        }

        user.setPassword(
            passwordEncoder.encode(request.password())
        );

        user.setRole(Role.PASSENGER);

        User savedUser =
            userRepository.save(user);

        String token =
            jwtService.generateToken(savedUser);

        return createResponse(
            savedUser,
            token
        );
    }

    public AuthResponse login(
        LoginRequest request
    ) {

        String email =
            request.email().trim().toLowerCase();

        User user =
            userRepository
                .findByEmailIgnoreCase(email)
                .orElseThrow(() ->
                    new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                    )
                );

        if (
            !passwordEncoder.matches(
                request.password(),
                user.getPassword()
            )
        ) {

            throw new ResponseStatusException(
                HttpStatus.UNAUTHORIZED,
                "Invalid email or password"
            );
        }

        String token =
            jwtService.generateToken(user);

        return createResponse(
            user,
            token
        );
    }

    private AuthResponse createResponse(
        User user,
        String token
    ) {

        return new AuthResponse(
            token,
            "Bearer",
            user.getId(),
            user.getName(),
            user.getEmail(),
            user.getRole().name()
        );
    }
}
