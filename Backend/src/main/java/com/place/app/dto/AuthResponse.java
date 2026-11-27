package com.place.app.dto;

public record AuthResponse(String accessToken, String refreshToken, UserResponse user) {
}
