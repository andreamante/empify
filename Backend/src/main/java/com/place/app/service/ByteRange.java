package com.place.app.service;

public record ByteRange(long start, long end) {
    public long length() {
        return end - start + 1;
    }

    public static ByteRange parse(String header, long size) {
        if (header == null || size <= 0) {
            throw new IllegalArgumentException("Invalid byte range");
        }
        header = header.trim();
        if (!header.startsWith("bytes=") || header.contains(",")) {
            throw new IllegalArgumentException("Invalid byte range");
        }

        String value = header.substring("bytes=".length()).trim();
        int separator = value.indexOf('-');
        if (separator < 0 || value.indexOf('-', separator + 1) >= 0) {
            throw new IllegalArgumentException("Invalid byte range");
        }

        try {
            String first = value.substring(0, separator).trim();
            String last = value.substring(separator + 1).trim();
            if (first.isEmpty()) {
                long suffixLength = Long.parseLong(last);
                if (suffixLength <= 0) {
                    throw new IllegalArgumentException("Invalid byte range");
                }
                long start = Math.max(0, size - suffixLength);
                return new ByteRange(start, size - 1);
            }

            long start = Long.parseLong(first);
            if (start < 0 || start >= size) {
                throw new IllegalArgumentException("Invalid byte range");
            }
            long end = last.isEmpty() ? size - 1 : Long.parseLong(last);
            if (end < start) {
                throw new IllegalArgumentException("Invalid byte range");
            }
            return new ByteRange(start, Math.min(end, size - 1));
        } catch (NumberFormatException exception) {
            throw new IllegalArgumentException("Invalid byte range", exception);
        }
    }
}
