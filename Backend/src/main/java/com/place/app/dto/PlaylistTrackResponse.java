package com.place.app.dto;

import java.time.OffsetDateTime;

public record PlaylistTrackResponse(Long trackId, Integer position, OffsetDateTime addedAt) {
}
