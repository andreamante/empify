package com.place.app.service;

import com.place.app.dto.AuthResponse;
import com.place.app.dto.UserResponse;
import com.place.app.persistence.entity.User;
import com.place.app.persistence.repository.UserRepository;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.core.Response;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;

@ApplicationScoped
public class AuthService {
    private static final long ACCESS_TOKEN_TTL_SECONDS = 900;

    @Inject
    UserRepository users;

    @Inject
    RefreshTokenService refreshTokens;

    @Transactional
    public AuthResponse register(String username, String email, String password, String deviceInfo) {
        validatePasswordLength(password);
        String normalizedUsername = username.trim();
        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        if (users.existsByUsername(normalizedUsername) || users.existsByEmail(normalizedEmail)) {
            throw new WebApplicationException("Username or email is already in use", Response.Status.CONFLICT);
        }

        User user = new User();
        user.username = normalizedUsername;
        user.email = normalizedEmail;
        user.passwordHash = BcryptUtil.bcryptHash(password);
        users.persist(user);

        return createSession(user, deviceInfo);
    }

    @Transactional
    public AuthResponse login(String email, String password, String deviceInfo) {
        validatePasswordLength(password);
        User user = users.findByEmail(email.trim())
                .filter(candidate -> BcryptUtil.matches(password, candidate.passwordHash))
                .orElseThrow(() -> new WebApplicationException(
                        "Invalid email or password", Response.Status.UNAUTHORIZED));
        return createSession(user, deviceInfo);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        RefreshTokenService.Rotation rotation = refreshTokens.rotate(rawRefreshToken);
        return new AuthResponse(createAccessToken(rotation.user()), rotation.refreshToken(), toResponse(rotation.user()));
    }

    @Transactional
    public void logout(long userId) {
        refreshTokens.revokeAllForUser(userId);
    }

    @Transactional
    public UserResponse getUser(long userId) {
        User user = users.findByIdOptional(userId)
                .orElseThrow(() -> new WebApplicationException("User not found", Response.Status.NOT_FOUND));
        return toResponse(user);
    }

    private AuthResponse createSession(User user, String deviceInfo) {
        String refreshToken = refreshTokens.issue(user, deviceInfo);
        return new AuthResponse(createAccessToken(user), refreshToken, toResponse(user));
    }

    private static String createAccessToken(User user) {
        Instant issuedAt = Instant.now();
        return Jwt.issuer("empify")
                .subject(user.id.toString())
                .groups(Set.of("user"))
                .issuedAt(issuedAt)
                .expiresAt(issuedAt.plusSeconds(ACCESS_TOKEN_TTL_SECONDS))
                .sign();
    }

    private static UserResponse toResponse(User user) {
        return new UserResponse(user.id.toString(), user.username, user.email, user.createdAt);
    }

    private static void validatePasswordLength(String password) {
        if (password.getBytes(StandardCharsets.UTF_8).length > 72) {
            throw new BadRequestException("Password must not exceed 72 UTF-8 bytes");
        }
    }
}
