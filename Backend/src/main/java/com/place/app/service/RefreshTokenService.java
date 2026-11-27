package com.place.app.service;

import com.place.app.persistence.entity.RefreshToken;
import com.place.app.persistence.entity.User;
import com.place.app.persistence.repository.RefreshTokenRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.Base64;

@ApplicationScoped
public class RefreshTokenService {
    private static final long REFRESH_TOKEN_TTL_DAYS = 30;
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Inject
    RefreshTokenRepository refreshTokens;

    @Transactional
    public String issue(User user, String deviceInfo) {
        String rawToken = generateToken();
        persist(user, rawToken, deviceInfo);
        return rawToken;
    }

    @Transactional
    public Rotation rotate(String rawToken) {
        RefreshToken current = refreshTokens.findByTokenHashForUpdate(hash(rawToken))
                .orElseThrow(() -> unauthorized("Invalid refresh token"));
        if (!current.expiresAt.isAfter(OffsetDateTime.now())) {
            throw unauthorized("Refresh token has expired");
        }

        User user = current.user;
        String deviceInfo = current.deviceInfo;
        refreshTokens.delete(current);

        String replacement = generateToken();
        persist(user, replacement, deviceInfo);
        return new Rotation(user, replacement);
    }

    @Transactional
    public void revokeAllForUser(long userId) {
        refreshTokens.deleteAllForUserId(userId);
    }

    private void persist(User user, String rawToken, String deviceInfo) {
        RefreshToken token = new RefreshToken();
        token.user = user;
        token.tokenHash = hash(rawToken);
        token.deviceInfo = truncate(deviceInfo, 255);
        token.expiresAt = OffsetDateTime.now().plusDays(REFRESH_TOKEN_TTL_DAYS);
        refreshTokens.persist(token);
    }

    private static String generateToken() {
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is not available", exception);
        }
    }

    private static String truncate(String value, int maxLength) {
        return value == null || value.length() <= maxLength ? value : value.substring(0, maxLength);
    }

    private static WebApplicationException unauthorized(String message) {
        return new WebApplicationException(message, Response.Status.UNAUTHORIZED);
    }

    public record Rotation(User user, String refreshToken) {
    }
}
