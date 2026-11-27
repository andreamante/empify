import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TrackService } from '../../core/services/track.service';

@Component({
  selector: 'app-upload-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './upload-page.html',
  styleUrl: './upload-page.scss',
})
export class UploadPage {
  private readonly trackService = inject(TrackService);
  readonly file = signal<File | null>(null);
  readonly title = signal('');
  readonly artist = signal('');
  readonly album = signal('');
  readonly error = signal('');
  readonly success = signal('');
  readonly busy = signal(false);
  readonly dragging = signal(false);

  selectFile(event: Event): void {
    const selected = (event.target as HTMLInputElement).files?.[0] ?? null;
    this.setFile(selected);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    this.setFile(event.dataTransfer?.files[0] ?? null);
  }

  private setFile(selected: File | null): void {
    this.error.set('');
    this.success.set('');
    if (!selected) {
      this.file.set(null);
      return;
    }
    if (!selected.type.startsWith('audio/')) {
      this.file.set(null);
      this.error.set('Scegli un file audio. Il formato selezionato non è riconosciuto come audio.');
      return;
    }

    this.file.set(selected);
    if (!this.title()) this.title.set(selected.name.replace(/\.[^.]+$/, ''));
  }

  submit(): void {
    const file = this.file();
    if (!file) {
      this.error.set('Seleziona prima un file audio.');
      return;
    }
    if (!this.title().trim() || !this.artist().trim()) {
      this.error.set('Inserisci almeno il titolo e l’artista.');
      return;
    }

    this.error.set('');
    this.success.set('');
    this.busy.set(true);
    this.trackService.upload(file, this.title().trim(), this.artist().trim(), this.album().trim()).subscribe({
      next: () => {
        this.busy.set(false);
        this.success.set('Brano aggiunto alla tua raccolta.');
        this.file.set(null);
        this.title.set('');
        this.artist.set('');
        this.album.set('');
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Caricamento non riuscito. Controlla il file e riprova.');
      },
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
}
