# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Angular standalone components and Signals; the existing project uses Angular 22. The frontend is being prepared for a Quarkus and PostgreSQL API at `http://localhost:8080/api`. The API is not yet available; use mock data until it is.

## Users

Inferred from the brief: people who want to listen to their own music collection on desktop and mobile web.

## Product Purpose

Empify lets users upload and listen to their personal music. Success means being able to manage and play one's own tracks across desktop and mobile.

## Positioning

Confirmed constraint: the library contains only music uploaded by its users; it is not a catalog of third-party or commercially streamed tracks.

## Operating Context

Users access Empify from desktop and mobile browsers. The frontend is developed independently while the backend is being built.

## Capabilities and Constraints

The requested frontend scope includes authentication, a track library, local mock audio for player testing, favorites, and playlists. Track uploads use multipart form data. The planned backend endpoints cover auth, tracks, streaming and covers, and playlists. These are future API contracts, not evidence that the backend is available.

The requested TypeScript models are `User`, `Track`, and `Playlist`, with the fields specified in the product brief. Services should support mock mode and be structured for switching to the API.

Open decisions: detailed authorization behavior, upload validation limits, supported audio formats, and accessibility requirements beyond standard web accessibility.

## Brand Commitments

The product name is Empify.

## Evidence on Hand

The product brief is the only source of product requirements. No real user library, album art, or supplied audio files were found in the frontend assets. Any demonstration tracks or artwork must be labeled as mock content.

## Product Principles

- Keep the library personal and user-owned.
- Make listening and library management work on desktop and mobile.
- Keep mock behavior aligned with the planned API contract.
- Distinguish sample content from users' real music.
