package com.place.app.persistence.repository;

import com.place.app.persistence.entity.TrackFile;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TrackFileRepository implements PanacheRepository<TrackFile> {
}
