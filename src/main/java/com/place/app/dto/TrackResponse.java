package com.place.app.dto;

import java.time.OffsetDateTime;

public record TrackResponse(
        Long id,
        String title,
        String artist,
        String album,
        Integer durationSeconds,
        String mimeType,
        Long fileSize,
        boolean hasCover,
        boolean isFavorite,
        Integer playCount,
        OffsetDateTime createdAt
) {
}
