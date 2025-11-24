package com.ehy.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

/**
 * Central provider for JWT configuration and cryptographic materials.
 * - Reads the JWT secret and expiration from configuration
 * - Exposes a {@link SecretKey} for signing and verifying tokens
 */
@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration:86400000}")
    private Long expirationTimeMs;

    /**
     * Provides the HMAC signing key derived from the configured secret.
     * @return SecretKey for signing/verifying JWTs
     */
    public SecretKey getSigningKey() {
        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Token expiration time in milliseconds.
     */
    public long getExpirationTimeMs() {
        return expirationTimeMs;
    }
}
