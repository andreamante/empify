import { HttpClient } from '@angular/common/http';
import { inject, Injectable, OnDestroy, signal } from '@angular/core';
import { forkJoin, map, Observable, of, shareReplay, tap, finalize, switchMap } from 'rxjs';
import { API_BASE_URL } from '../api';
import { MOCK_TRACKS } from '../mock-data';
import { Track } from '../models';

@Injectable({ providedIn: 'root' })
export class TrackService implements OnDestroy {
  readonly useMock = false;
  readonly tracks = signal<Track[]>(this.useMock ? MOCK_TRACKS.map((track) => ({ ...track })) : []);
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${API_BASE_URL}/tracks`;
  private readonly coverUrls = new Map<string, string>();
  private readonly coverRequests = new Map<string, Observable<string>>();

  loadTracks(): Observable<Track[]> {
    if (this.useMock) return of(this.tracks());
    return this.http
      .get<Track[]>(this.apiUrl)
      .pipe(
        switchMap((tracks) => this.withCoverUrls(tracks)),
        tap((tracks) => this.tracks.set(tracks)),
      );
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
      switchMap((track) => this.withCoverUrl(track)),
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
        switchMap((track) => this.withCoverUrl(track)),
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

  withCoverUrls(tracks: Track[]): Observable<Track[]> {
    return tracks.length
      ? forkJoin(tracks.map((track) => this.withCoverUrl(track)))
      : of([]);
  }

  private withCoverUrl(track: Track): Observable<Track> {
    const audioUrl = `${this.apiUrl}/${track.id}/stream`;
    if (!track.hasCover) return of({ ...track, audioUrl, coverUrl: undefined });
    const cachedUrl = this.coverUrls.get(track.id);
    if (cachedUrl) return of({ ...track, audioUrl, coverUrl: cachedUrl });

    let coverRequest = this.coverRequests.get(track.id);
    if (!coverRequest) {
      coverRequest = this.http
        .get(`${this.apiUrl}/${track.id}/cover`, { responseType: 'blob' })
        .pipe(
          map((blob) => URL.createObjectURL(blob)),
          tap((url) => this.coverUrls.set(track.id, url)),
          finalize(() => this.coverRequests.delete(track.id)),
          shareReplay({ bufferSize: 1, refCount: false }),
        );
      this.coverRequests.set(track.id, coverRequest);
    }

    return coverRequest.pipe(
      map((coverUrl) => ({ ...track, audioUrl, coverUrl })),
    );
  }

  ngOnDestroy(): void {
    this.coverUrls.forEach((url) => URL.revokeObjectURL(url));
    this.coverUrls.clear();
  }
}
