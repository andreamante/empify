package com.place.app.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record PlaylistResponse(
        Long id,
        String name,
        String description,
        OffsetDateTime createdAt,
        List<PlaylistTrackResponse> tracks
) {
}
