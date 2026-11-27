import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { API_BASE_URL } from '../api';
import { MOCK_TRACKS } from '../mock-data';
import { Track } from '../models';

@Injectable({ providedIn: 'root' })
export class TrackService {
  readonly useMock = true;
  readonly tracks = signal<Track[]>(MOCK_TRACKS.map((track) => ({ ...track })));
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/tracks`;

  loadTracks(): Observable<Track[]> {
    if (this.useMock) return of(this.tracks());
    return this.http
      .get<Track[]>(this.apiUrl)
      .pipe(tap((tracks) => this.tracks.set(tracks.map((track) => this.withMediaUrls(track)))));
  }

  toggleFavorite(trackId: string): Observable<void> {
    if (this.useMock) {
      this.tracks.update((tracks) =>
        tracks.map((track) =>
          track.id === trackId ? { ...track, isFavorite: !track.isFavorite } : track,
        ),
      );
      return of(void 0);
    }

    return this.http.patch<Track>(`${this.apiUrl}/${trackId}/favorite`, {}).pipe(
      tap((updatedTrack) =>
        this.tracks.update((tracks) =>
          tracks.map((track) => (track.id === trackId ? updatedTrack : track)),
        ),
      ),
      map(() => void 0),
    );
  }

  upload(file: File, title: string, artist: string, album: string): Observable<Track> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('album', album);

    if (!this.useMock) {
      return this.http.post<Track>(this.apiUrl, formData).pipe(
        map((track) => this.withMediaUrls(track)),
        tap((track) => this.tracks.update((tracks) => [track, ...tracks])),
      );
    }

    const track: Track = {
      id: crypto.randomUUID(),
      title,
      artist,
      album,
      durationSeconds: 0,
      mimeType: file.type || 'application/octet-stream',
      fileSize: file.size,
      hasCover: false,
      isFavorite: false,
      playCount: 0,
      createdAt: new Date().toISOString(),
      audioUrl: URL.createObjectURL(file),
    };
    this.tracks.update((tracks) => [track, ...tracks]);
    return of(track);
  }

  deleteTrack(trackId: string): Observable<void> {
    if (this.useMock) {
      this.tracks.update((tracks) => tracks.filter((track) => track.id !== trackId));
      return of(void 0);
    }

    return this.http.delete<void>(`${this.apiUrl}/${trackId}`).pipe(
      tap(() => this.tracks.update((tracks) => tracks.filter((track) => track.id !== trackId))),
    );
  }

  private withMediaUrls(track: Track): Track {
    return {
      ...track,
      audioUrl: track.audioUrl ?? `${this.apiUrl}/${track.id}/stream`,
      coverUrl: track.coverUrl ?? (track.hasCover ? `${this.apiUrl}/${track.id}/cover` : undefined),
    };
  }
}
