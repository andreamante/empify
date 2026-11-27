package com.place.app.service;

import com.place.app.dto.TrackResponse;
import com.place.app.persistence.entity.Track;
import com.place.app.persistence.entity.TrackFile;
import com.place.app.persistence.entity.User;
import com.place.app.persistence.repository.TrackCoverRepository;
import com.place.app.persistence.repository.TrackFileRepository;
import com.place.app.persistence.repository.TrackRepository;
import com.place.app.persistence.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import org.jboss.resteasy.reactive.multipart.FileUpload;

import java.io.IOException;
import java.nio.file.Files;
import java.util.List;
import java.util.Locale;

@ApplicationScoped
public class TrackService {
    private static final long MAX_AUDIO_SIZE_BYTES = 100L * 1024 * 1024;

    @Inject
    TrackRepository tracks;

    @Inject
    TrackFileRepository trackFiles;

    @Inject
    TrackCoverRepository trackCovers;

    @Inject
    UserRepository users;

    @Transactional
    public List<TrackResponse> list(long userId) {
        return tracks.findAllByUserId(userId).stream().map(TrackService::toResponse).toList();
    }

    @Transactional
    public TrackResponse upload(long userId, FileUpload upload, String title, String artist, String album) {
        if (upload == null || upload.size() == 0 || upload.size() > MAX_AUDIO_SIZE_BYTES) {
            throw new BadRequestException("Audio file must be between 1 byte and 100 MB");
        }
        if (title == null || title.isBlank() || title.trim().length() > 255) {
            throw new BadRequestException("Track title is required and must be at most 255 characters");
        }
        if (hasTooManyCharacters(artist) || hasTooManyCharacters(album)) {
            throw new BadRequestException("Artist and album must be at most 255 characters");
        }

        User user = users.findByIdOptional(userId).orElseThrow(NotFoundException::new);
        byte[] content;
        try {
            content = Files.readAllBytes(upload.uploadedFile());
        } catch (IOException exception) {
            throw new jakarta.ws.rs.InternalServerErrorException("Could not read uploaded audio file", exception);
        }
        if (content.length == 0 || content.length > MAX_AUDIO_SIZE_BYTES) {
            throw new BadRequestException("Audio file must be between 1 byte and 100 MB");
        }

        Track track = new Track();
        track.user = user;
        track.title = title.trim();
        track.artist = normalizeOptional(artist);
        track.album = normalizeOptional(album);
        track.mimeType = normalizeMimeType(upload.contentType());
        track.fileSize = (long) content.length;
        track.hasCover = false;
        track.isFavorite = false;
        tracks.persist(track);

        TrackFile trackFile = new TrackFile();
        trackFile.track = track;
        trackFile.data = content;
        trackFiles.persist(trackFile);
        return toResponse(track);
    }

    @Transactional
    public void delete(long userId, long trackId) {
        Track track = findOwned(userId, trackId);
        tracks.delete(track);
    }

    @Transactional
    public TrackResponse toggleFavorite(long userId, long trackId) {
        Track track = findOwned(userId, trackId);
        track.isFavorite = !track.isFavorite;
        return toResponse(track);
    }

    @Transactional
    public AudioData stream(long userId, long trackId) {
        Track track = findOwned(userId, trackId);
        TrackFile file = trackFiles.findByIdOptional(trackId)
                .orElseThrow(() -> new NotFoundException("Audio file not found"));
        return new AudioData(file.data, track.mimeType);
    }

    @Transactional
    public AudioData cover(long userId, long trackId) {
        findOwned(userId, trackId);
        return trackCovers.findByIdOptional(trackId)
                .map(cover -> new AudioData(cover.data, cover.mimeType))
                .orElseThrow(() -> new NotFoundException("Track cover not found"));
    }

    private Track findOwned(long userId, long trackId) {
        return tracks.findByIdAndUserId(trackId, userId)
                .orElseThrow(() -> new NotFoundException("Track not found"));
    }

    private static String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private static boolean hasTooManyCharacters(String value) {
        return value != null && value.trim().length() > 255;
    }

    private static String normalizeMimeType(String contentType) {
        if (contentType == null || contentType.isBlank()) {
            return "application/octet-stream";
        }
        return contentType.toLowerCase(Locale.ROOT);
    }

    public static TrackResponse toResponse(Track track) {
        return new TrackResponse(
                track.id.toString(),
                track.title,
                track.artist == null ? "" : track.artist,
                track.album == null ? "" : track.album,
                track.durationSeconds,
                track.mimeType,
                track.fileSize,
                track.hasCover,
                track.isFavorite,
                track.playCount,
                track.createdAt);
    }

    public record AudioData(byte[] data, String mimeType) {
    }
}
