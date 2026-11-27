package com.place.app.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

import java.io.Serializable;
import java.util.Objects;

@Embeddable
public class PlaylistTrackId implements Serializable {
    @Column(name = "playlist_id")
    public Long playlistId;

    @Column(name = "track_id")
    public Long trackId;

    public PlaylistTrackId() {
    }

    public PlaylistTrackId(Long playlistId, Long trackId) {
        this.playlistId = playlistId;
        this.trackId = trackId;
    }

    @Override
    public boolean equals(Object other) {
        if (this == other) {
            return true;
        }
        if (!(other instanceof PlaylistTrackId that)) {
            return false;
        }
        return Objects.equals(playlistId, that.playlistId)
                && Objects.equals(trackId, that.trackId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(playlistId, trackId);
    }
}
