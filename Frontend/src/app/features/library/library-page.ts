import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AudioService } from '../../core/services/audio.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { TrackService } from '../../core/services/track.service';
import { Track } from '../../core/models';

@Component({
  selector: 'app-library-page',
  imports: [RouterLink],
  templateUrl: './library-page.html',
  styleUrl: './library-page.scss',
})
export class LibraryPage {
  readonly trackService = inject(TrackService);
  readonly playlistService = inject(PlaylistService);
  readonly audio = inject(AudioService);
  readonly query = signal('');
  readonly selectedPlaylistId = signal('');
  readonly error = signal('');
  readonly pendingDeleteId = signal('');
  private readonly isFavoriteRoute = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => data['filter'] === 'favorites')),
    { initialValue: false },
  );
  readonly favoriteOnly = computed(() => this.isFavoriteRoute());
  readonly title = computed(() => this.favoriteOnly() ? 'I tuoi preferiti' : 'La tua raccolta');
  readonly favoriteCount = computed(
    () => this.trackService.tracks().filter((track) => track.isFavorite).length,
  );
  readonly visibleTracks = computed(() => {
    const search = this.query().trim().toLocaleLowerCase();
    return this.trackService.tracks().filter((track) => {
      const matchesSearch = `${track.title} ${track.artist} ${track.album}`
        .toLocaleLowerCase()
        .includes(search);
      return matchesSearch && (!this.favoriteOnly() || track.isFavorite);
    });
  });

  constructor() {
    this.trackService.loadTracks().subscribe({
      error: () => this.error.set('Non è stato possibile caricare i brani. Riprova.'),
    });
    this.playlistService.loadPlaylists().subscribe({
      next: (playlists) => this.selectedPlaylistId.set(playlists[0]?.id ?? ''),
      error: () => this.error.set('Non è stato possibile caricare le playlist. Riprova.'),
    });
  }

  play(track: Track): void {
    this.audio.playQueue(this.visibleTracks(), track);
  }

  toggleFavorite(track: Track): void {
    this.error.set('');
    this.trackService.toggleFavorite(track.id).subscribe({
      error: () => this.error.set('Non è stato possibile aggiornare i preferiti. Riprova.'),
    });
  }

  addToPlaylist(track: Track): void {
    const playlistId = this.selectedPlaylistId();
    if (!playlistId) {
      this.error.set('Crea una playlist prima di aggiungere brani.');
      return;
    }

    this.playlistService.addTrack(playlistId, track).subscribe({
      error: () => this.error.set('Non è stato possibile aggiungere il brano alla playlist.'),
    });
  }

  requestDelete(trackId: string): void {
    this.pendingDeleteId.set(trackId);
  }

  cancelDelete(): void {
    this.pendingDeleteId.set('');
  }

  deleteTrack(track: Track): void {
    this.error.set('');
    this.trackService.deleteTrack(track.id).subscribe({
      next: () => {
        if (this.audio.currentTrack()?.id === track.id) this.audio.stop();
        this.pendingDeleteId.set('');
      },
      error: () => this.error.set('Non è stato possibile rimuovere il brano. Riprova.'),
    });
  }

  setQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
  }

  setPlaylist(event: Event): void {
    this.selectedPlaylistId.set((event.target as HTMLSelectElement).value);
  }

  formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '--:--';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }
}
