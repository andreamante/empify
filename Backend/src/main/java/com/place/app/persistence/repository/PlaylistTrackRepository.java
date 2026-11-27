package com.place.app.persistence.repository;

import com.place.app.persistence.entity.PlaylistTrack;
import com.place.app.persistence.entity.PlaylistTrackId;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PlaylistTrackRepository implements PanacheRepositoryBase<PlaylistTrack, PlaylistTrackId> {
    public List<PlaylistTrack> findAllByPlaylistId(long playlistId) {
        return find("playlist.id = ?1 order by position", playlistId).list();
    }

    public Optional<PlaylistTrack> findLink(long playlistId, long trackId) {
        return findByIdOptional(new PlaylistTrackId(playlistId, trackId));
    }

}
