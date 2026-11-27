package com.place.app.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreatePlaylistRequest(
        @NotBlank @Size(max = 255) String name,
        @Size(max = 10000) String description
) {
}
