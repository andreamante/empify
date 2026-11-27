package com.place.app.persistence.repository;

import com.place.app.persistence.entity.TrackCover;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TrackCoverRepository implements PanacheRepository<TrackCover> {
}
