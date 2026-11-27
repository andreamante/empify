package com.place.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record FavoriteRequest(@JsonProperty("isFavorite") boolean isFavorite) {
}
