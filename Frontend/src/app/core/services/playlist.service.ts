import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { API_BASE_URL } from '../api';
import { MOCK_PLAYLISTS } from '../mock-data';
import { Playlist, Track } from '../models';
import { TrackService } from './track.service';

@Injectable({ providedIn: 'root' })
export class PlaylistService {
  readonly useMock = false;
  readonly playlists = signal<Playlist[]>(this.useMock ? MOCK_PLAYLISTS.map((playlist) => ({ ...playlist })) : []);
  private readonly http = inject(HttpClient);
  private readonly trackService = inject(TrackService);
  private readonly apiUrl = `${API_BASE_URL}/playlists`;

  loadPlaylists(): Observable<Playlist[]> {
    if (this.useMock) return of(this.playlists());
    return this.http.get<Playlist[]>(this.apiUrl).pipe(
      switchMap((items) =>
        items.length
          ? forkJoin(items.map((playlist) => this.withTrackCovers(playlist)))
          : of([]),
      ),
      tap((items) => this.playlists.set(items)),
    );
  }

  loadPlaylist(playlistId: string): Observable<Playlist> {
    if (this.useMock) {
      const playlist = this.playlists().find((item) => item.id === playlistId);
      return playlist
        ? of(playlist)
        : throwError(() => new Error(`Playlist not found: ${playlistId}`));
    }

    return this.http
      .get<Playlist>(`${this.apiUrl}/${playlistId}`)
      .pipe(switchMap((playlist) => this.withTrackCovers(playlist)));
  }

  create(name: string, description: string): Observable<Playlist> {
    if (!this.useMock) {
      return this.http.post<Playlist>(this.apiUrl, { name, description }).pipe(
        tap((playlist) => this.playlists.update((items) => [playlist, ...items])),
      );
    }

    const playlist: Playlist = {
      id: crypto.randomUUID(),
      name,
      description,
      createdAt: new Date().toISOString(),
      tracks: [],
    };
    this.playlists.update((items) => [playlist, ...items]);
    return of(playlist);
  }

  remove(playlistId: string): Observable<void> {
    if (this.useMock) {
      this.playlists.update((items) => items.filter((playlist) => playlist.id !== playlistId));
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiUrl}/${playlistId}`).pipe(
      tap(() => this.playlists.update((items) => items.filter((playlist) => playlist.id !== playlistId))),
    );
  }

  addTrack(playlistId: string, track: Track): Observable<void> {
    if (this.useMock) {
      this.playlists.update((items) =>
        items.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, tracks: [...(playlist.tracks ?? []), track] }
            : playlist,
        ),
      );
      return of(void 0);
    }

    return this.http.post<void>(`${this.apiUrl}/${playlistId}/tracks`, { trackId: track.id }).pipe(
      tap(() =>
        this.playlists.update((items) =>
          items.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, tracks: [...(playlist.tracks ?? []), track] }
              : playlist,
          ),
        ),
      ),
    );
  }

  removeTrack(playlistId: string, trackId: string): Observable<void> {
    if (this.useMock) {
      this.playlists.update((items) =>
        items.map((playlist) =>
          playlist.id === playlistId
            ? { ...playlist, tracks: (playlist.tracks ?? []).filter((track) => track.id !== trackId) }
            : playlist,
        ),
      );
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiUrl}/${playlistId}/tracks/${trackId}`).pipe(
      tap(() =>
        this.playlists.update((items) =>
          items.map((playlist) =>
            playlist.id === playlistId
              ? { ...playlist, tracks: (playlist.tracks ?? []).filter((track) => track.id !== trackId) }
              : playlist,
          ),
        ),
      ),
    );
  }

  private withTrackCovers(playlist: Playlist): Observable<Playlist> {
    const tracks = playlist.tracks ?? [];
    return this.trackService.withCoverUrls(tracks).pipe(
      map((coveredTracks) => ({ ...playlist, tracks: coveredTracks })),
    );
  }
}
