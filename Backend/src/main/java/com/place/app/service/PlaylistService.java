package com.place.app.service;

import com.place.app.dto.PlaylistResponse;
import com.place.app.dto.TrackResponse;
import com.place.app.persistence.entity.Playlist;
import com.place.app.persistence.entity.PlaylistTrack;
import com.place.app.persistence.entity.PlaylistTrackId;
import com.place.app.persistence.entity.Track;
import com.place.app.persistence.entity.User;
import com.place.app.persistence.repository.PlaylistRepository;
import com.place.app.persistence.repository.PlaylistTrackRepository;
import com.place.app.persistence.repository.TrackRepository;
import com.place.app.persistence.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

import java.util.List;

@ApplicationScoped
public class PlaylistService {
    @Inject
    PlaylistRepository playlists;

    @Inject
    PlaylistTrackRepository playlistTracks;

    @Inject
    TrackRepository tracks;

    @Inject
    UserRepository users;

    @Transactional
    public List<PlaylistResponse> list(long userId) {
        return playlists.findAllByUserId(userId).stream()
                .map(playlist -> toResponse(playlist, List.of()))
                .toList();
    }

    @Transactional
    public PlaylistResponse get(long userId, long playlistId) {
        Playlist playlist = findOwned(userId, playlistId);
        List<TrackResponse> linkedTracks = playlistTracks.findAllByPlaylistId(playlistId).stream()
                .map(link -> TrackService.toResponse(link.track))
                .toList();
        return toResponse(playlist, linkedTracks);
    }

    @Transactional
    public PlaylistResponse create(long userId, String name, String description) {
        if (name == null || name.isBlank()) {
            throw new BadRequestException("Playlist name is required");
        }
        User user = users.findByIdOptional(userId).orElseThrow(NotFoundException::new);
        Playlist playlist = new Playlist();
        playlist.user = user;
        playlist.name = name.trim();
        playlist.description = description == null || description.isBlank() ? null : description.trim();
        playlists.persist(playlist);
        return toResponse(playlist, List.of());
    }

    @Transactional
    public void delete(long userId, long playlistId) {
        playlists.delete(findOwned(userId, playlistId));
    }

    @Transactional
    public void addTrack(long userId, long playlistId, long trackId, Integer requestedPosition) {
        Playlist playlist = findOwned(userId, playlistId);
        Track track = tracks.findByIdAndUserId(trackId, userId)
                .orElseThrow(() -> new NotFoundException("Track not found"));
        if (playlistTracks.findLink(playlistId, trackId).isPresent()) {
            throw new WebApplicationException("Track is already in this playlist", Response.Status.CONFLICT);
        }

        List<PlaylistTrack> existing = playlistTracks.findAllByPlaylistId(playlistId);
        int position = requestedPosition == null ? existing.size() : requestedPosition;
        if (position < 0 || position > existing.size()) {
            throw new BadRequestException("Position must be between 0 and the playlist size");
        }
        for (PlaylistTrack link : existing) {
            if (link.position >= position) {
                link.position++;
            }
        }

        PlaylistTrack link = new PlaylistTrack();
        link.id = new PlaylistTrackId(playlist.id, track.id);
        link.playlist = playlist;
        link.track = track;
        link.position = position;
        playlistTracks.persist(link);
    }

    @Transactional
    public void removeTrack(long userId, long playlistId, long trackId) {
        findOwned(userId, playlistId);
        PlaylistTrack link = playlistTracks.findLink(playlistId, trackId)
                .orElseThrow(() -> new NotFoundException("Track is not in this playlist"));
        playlistTracks.delete(link);
        for (PlaylistTrack remaining : playlistTracks.findAllByPlaylistId(playlistId)) {
            if (remaining.position > link.position) {
                remaining.position--;
            }
        }
    }

    private Playlist findOwned(long userId, long playlistId) {
        return playlists.findByIdAndUserId(playlistId, userId)
                .orElseThrow(() -> new NotFoundException("Playlist not found"));
    }

    private static PlaylistResponse toResponse(Playlist playlist, List<TrackResponse> tracks) {
        return new PlaylistResponse(
                playlist.id.toString(),
                playlist.name,
                playlist.description == null ? "" : playlist.description,
                playlist.createdAt,
                tracks);
    }
}
