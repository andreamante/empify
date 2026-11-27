package com.place.app.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class TrackResponseJsonTest {
    @Test
    void declaresCamelCaseTrackFieldsAndFavoriteJsonName() throws NoSuchMethodException {
        var fields = java.util.Arrays.stream(TrackResponse.class.getRecordComponents())
                .map(java.lang.reflect.RecordComponent::getName)
                .toList();

        assertTrue(fields.contains("durationSeconds"));
        assertTrue(fields.contains("hasCover"));
        assertFalse(fields.contains("favorite"));
        assertEquals("isFavorite",
                TrackResponse.class.getMethod("isFavorite").getAnnotation(JsonProperty.class).value());
        assertEquals(String.class, TrackResponse.class.getRecordComponents()[0].getType());
    }
}
