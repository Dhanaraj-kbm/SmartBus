package com.smartbus.security;

import com.smartbus.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtService(
        @Value("${jwt.secret}") String secret,
        @Value("${jwt.expiration-ms}") long expirationMs
    ) {
        if (secret == null || secret.length() < 32) {
            throw new IllegalArgumentException(
                "JWT secret must contain at least 32 characters"
            );
        }

        this.secretKey = Keys.hmacShaKeyFor(
            secret.getBytes(StandardCharsets.UTF_8)
        );

        this.expirationMs = expirationMs;
    }

    public String generateToken(User user) {

        Date issuedAt = new Date();
        Date expiration = new Date(
            issuedAt.getTime() + expirationMs
        );

        return Jwts.builder()
            .subject(user.getEmail())
            .claim("userId", user.getId())
            .claim("name", user.getName())
            .claim("role", user.getRole().name())
            .issuedAt(issuedAt)
            .expiration(expiration)
            .signWith(secretKey)
            .compact();
    }

    public String extractEmail(String token) {

        return getClaims(token).getSubject();
    }

    public boolean isTokenValid(String token) {

        try {
            Claims claims = getClaims(token);

            return claims.getExpiration()
                .after(new Date());

        } catch (Exception exception) {
            return false;
        }
    }

    private Claims getClaims(String token) {

        return Jwts.parser()
            .verifyWith(secretKey)
            .build()
            .parseSignedClaims(token)
            .getPayload();
    }
}
