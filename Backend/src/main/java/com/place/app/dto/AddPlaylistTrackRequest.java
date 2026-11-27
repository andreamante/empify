package com.place.app.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record AddPlaylistTrackRequest(
        @NotNull @Pattern(regexp = "[1-9][0-9]*") String trackId,
        Integer position
) {
}
