package com.place.app.dto;

import java.time.OffsetDateTime;

public record UserResponse(String id, String username, String email, OffsetDateTime createdAt) {
}
