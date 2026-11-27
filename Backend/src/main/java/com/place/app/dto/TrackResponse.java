package com.place.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

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
        @JsonProperty("isFavorite")
        boolean isFavorite,
        Integer playCount,
        OffsetDateTime createdAt
) {
}
