import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AudioService } from './core/services/audio.service';
import { AuthService } from './core/services/auth.service';
import { TrackService } from './core/services/track.service';

@Component({
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  readonly audio = inject(AudioService);
  readonly auth = inject(AuthService);
  readonly trackService = inject(TrackService);
  readonly router = inject(Router);
  readonly logoutError = signal('');
  readonly playerActionError = signal('');

  seek(event: Event): void {
    this.audio.seek(Number((event.target as HTMLInputElement).value));
  }

  setVolume(event: Event): void {
    this.audio.setVolume(Number((event.target as HTMLInputElement).value));
  }

  togglePlayerFavorite(): void {
    const track = this.audio.currentTrack();
    if (!track) return;
    this.playerActionError.set('');
    this.trackService.toggleFavorite(track.id).subscribe({
      next: () =>
        this.audio.currentTrack.update((current) =>
          current ? { ...current, isFavorite: !current.isFavorite } : null,
        ),
      error: () => this.playerActionError.set('Non è stato possibile aggiornare i preferiti.'),
    });
  }

  formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
    return `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
  }

  logout(): void {
    this.logoutError.set('');
    this.auth.logout().subscribe({
      next: () => void this.router.navigateByUrl('/login'),
      error: () => this.logoutError.set('Non è stato possibile uscire. Riprova.'),
    });
  }
}
