package com.place.app.persistence.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;

@Entity
@Table(name = "tracks")
public class Track {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Column(nullable = false, length = 255)
    public String title;

    @Column(length = 255)
    public String artist;

    @Column(length = 255)
    public String album;

    @Column(name = "duration_seconds", nullable = false)
    public Integer durationSeconds;

    @Column(name = "mime_type", nullable = false, length = 100)
    public String mimeType;

    @Column(name = "file_size", nullable = false)
    public Long fileSize;

    @Column(name = "has_cover", nullable = false)
    public boolean hasCover;

    @Column(name = "is_favorite", nullable = false)
    public boolean isFavorite;

    @Column(name = "play_count", nullable = false)
    public Integer playCount;

    @Column(name = "created_at", nullable = false)
    public OffsetDateTime createdAt;
}
