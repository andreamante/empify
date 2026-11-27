package com.place.app.persistence.repository;

import com.place.app.persistence.entity.Track;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class TrackRepository implements PanacheRepository<Track> {
    public List<Track> findAllByUserId(long userId) {
        return find("user.id = ?1 order by createdAt desc", userId).list();
    }

    public Optional<Track> findByIdAndUserId(long trackId, long userId) {
        return find("id = ?1 and user.id = ?2", trackId, userId).firstResultOptional();
    }
}
