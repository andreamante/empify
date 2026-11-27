package com.place.app.persistence.repository;

import com.place.app.persistence.entity.Playlist;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PlaylistRepository implements PanacheRepository<Playlist> {
    public List<Playlist> findAllByUserId(long userId) {
        return find("user.id = ?1 order by createdAt desc", userId).list();
    }

    public Optional<Playlist> findByIdAndUserId(long playlistId, long userId) {
        return find("id = ?1 and user.id = ?2", playlistId, userId).firstResultOptional();
    }
}
