import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AudioService } from '../../core/services/audio.service';
import { PlaylistService } from '../../core/services/playlist.service';
import { TrackService } from '../../core/services/track.service';
import { Playlist, Track } from '../../core/models';

@Component({
  selector: 'app-playlists-page',
  imports: [FormsModule],
  templateUrl: './playlists-page.html',
  styleUrl: './playlists-page.scss',
})
export class PlaylistsPage {
  readonly playlistService = inject(PlaylistService);
  readonly trackService = inject(TrackService);
  readonly audio = inject(AudioService);
  readonly selectedId = signal(this.playlistService.playlists()[0]?.id ?? '');
  readonly showForm = signal(false);
  readonly name = signal('');
  readonly description = signal('');
  readonly addTrackId = signal('');
  readonly error = signal('');
  readonly selectedPlaylist = computed(
    () => this.playlistService.playlists().find((playlist) => playlist.id === this.selectedId()) ?? null,
  );

  toggleForm(): void {
    this.showForm.update((value) => !value);
  }

  constructor() {
    this.playlistService.loadPlaylists().subscribe({
      next: (playlists) => {
        if (!this.selectedId() && playlists[0]) this.selectedId.set(playlists[0].id);
      },
      error: () => this.error.set('Non è stato possibile caricare le playlist. Riprova.'),
    });
    this.trackService.loadTracks().subscribe({
      error: () => this.error.set('Non è stato possibile caricare i brani. Riprova.'),
    });
  }

  createPlaylist(): void {
    const name = this.name().trim();
    if (!name) {
      this.error.set('Inserisci un nome per la playlist.');
      return;
    }
    this.error.set('');
    this.playlistService.create(name, this.description().trim()).subscribe({
      next: (playlist) => {
        this.selectedId.set(playlist.id);
        this.name.set('');
        this.description.set('');
        this.showForm.set(false);
      },
      error: () => this.error.set('Non è stato possibile creare la playlist. Riprova.'),
    });
  }

  deletePlaylist(playlist: Playlist): void {
    this.playlistService.remove(playlist.id).subscribe({
      next: () => {
        const remaining = this.playlistService.playlists();
        this.selectedId.set(remaining[0]?.id ?? '');
      },
      error: () => this.error.set('Non è stato possibile eliminare la playlist. Riprova.'),
    });
  }

  addSelectedTrack(): void {
    const playlist = this.selectedPlaylist();
    const track = this.trackService.tracks().find((item) => item.id === this.addTrackId());
    if (!playlist || !track) {
      this.error.set('Scegli un brano da aggiungere.');
      return;
    }
    this.playlistService.addTrack(playlist.id, track).subscribe({
      next: () => this.addTrackId.set(''),
      error: () => this.error.set('Non è stato possibile aggiungere il brano. Riprova.'),
    });
  }

  removeTrack(playlist: Playlist, track: Track): void {
    this.playlistService.removeTrack(playlist.id, track.id).subscribe({
      error: () => this.error.set('Non è stato possibile rimuovere il brano. Riprova.'),
    });
  }

  play(playlist: Playlist, track: Track): void {
    this.audio.playQueue(playlist.tracks ?? [], track);
  }

  playFirst(playlist: Playlist): void {
    const first = playlist.tracks?.[0];
    if (first) this.play(playlist, first);
  }

  formatDuration(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds <= 0) return '--:--';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }
}
