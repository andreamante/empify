package com.place.app.service;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ByteRangeTest {
    @Test
    void parsesExplicitRange() {
        assertEquals(new ByteRange(2, 5), ByteRange.parse("bytes=2-5", 10));
    }

    @Test
    void parsesOpenEndedRange() {
        assertEquals(new ByteRange(7, 9), ByteRange.parse("bytes=7-", 10));
    }

    @Test
    void parsesSuffixRange() {
        assertEquals(new ByteRange(7, 9), ByteRange.parse("bytes=-3", 10));
    }

    @Test
    void clampsRangeEndToFileSize() {
        assertEquals(new ByteRange(8, 9), ByteRange.parse("bytes=8-20", 10));
    }

    @Test
    void rejectsUnsatisfiableAndMultipleRanges() {
        assertThrows(IllegalArgumentException.class, () -> ByteRange.parse("bytes=10-", 10));
        assertThrows(IllegalArgumentException.class, () -> ByteRange.parse("bytes=1-2,4-5", 10));
        assertThrows(IllegalArgumentException.class, () -> ByteRange.parse("bytes=-0", 10));
    }
}
