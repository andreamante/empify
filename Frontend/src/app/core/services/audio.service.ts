import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Track } from '../models';

@Injectable({ providedIn: 'root' })
export class AudioService {
  readonly currentTrack = signal<Track | null>(null);
  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);
  readonly volume = signal(0.75);
  readonly error = signal('');
  readonly progress = computed(() =>
    this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0,
  );
  private readonly platformId = inject(PLATFORM_ID);
  private audio: HTMLAudioElement | null = null;
  private queue: Track[] = [];

  play(track?: Track): void {
    if (track) this.currentTrack.set(track);
    const current = this.currentTrack();
    if (!current || !isPlatformBrowser(this.platformId)) return;
    if (!current.audioUrl) {
      this.error.set('Questo brano non ha un file audio disponibile.');
      return;
    }

    this.error.set('');
    const audio = this.getAudio();
    if (audio.src !== new URL(current.audioUrl, document.baseURI).href) {
      this.currentTime.set(0);
      this.duration.set(0);
      audio.src = current.audioUrl;
      audio.load();
    }
    void audio.play().catch(() => {
      this.isPlaying.set(false);
      this.error.set('Il file non è riproducibile. Scegli un altro brano o controlla il formato.');
    });
  }

  playQueue(tracks: Track[], startAt: Track): void {
    this.queue = tracks;
    this.play(startAt);
  }

  toggle(): void {
    if (this.isPlaying()) {
      this.audio?.pause();
      return;
    }
    this.play();
  }

  next(): void {
    this.moveBy(1);
  }

  previous(): void {
    if (this.currentTime() > 3 && this.audio) {
      this.audio.currentTime = 0;
      return;
    }
    this.moveBy(-1);
  }

  seek(value: number): void {
    if (this.audio && Number.isFinite(value)) this.audio.currentTime = value;
  }

  setVolume(value: number): void {
    if (!Number.isFinite(value)) return;
    const volume = Math.min(1, Math.max(0, value));
    this.volume.set(volume);
    if (this.audio) this.audio.volume = volume;
  }

  stop(): void {
    this.audio?.pause();
    if (this.audio) this.audio.currentTime = 0;
    this.currentTrack.set(null);
    this.currentTime.set(0);
    this.duration.set(0);
    this.isPlaying.set(false);
    this.queue = [];
  }

  private moveBy(offset: number): void {
    const current = this.currentTrack();
    if (!current || this.queue.length === 0) return;
    const currentIndex = this.queue.findIndex((track) => track.id === current.id);
    const nextIndex = (currentIndex + offset + this.queue.length) % this.queue.length;
    this.play(this.queue[nextIndex]);
  }

  private getAudio(): HTMLAudioElement {
    if (this.audio) return this.audio;

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.volume = this.volume();
    audio.addEventListener('play', () => this.isPlaying.set(true));
    audio.addEventListener('pause', () => this.isPlaying.set(false));
    audio.addEventListener('timeupdate', () => this.currentTime.set(audio.currentTime));
    audio.addEventListener('loadedmetadata', () => this.duration.set(audio.duration || 0));
    audio.addEventListener('ended', () => this.handleEnded(audio));
    audio.addEventListener('error', () => {
      this.isPlaying.set(false);
      this.error.set('Impossibile caricare il file audio.');
    });
    this.audio = audio;
    return audio;
  }

  private handleEnded(audio: HTMLAudioElement): void {
    const current = this.currentTrack();
    const currentIndex = this.queue.findIndex((track) => track.id === current?.id);
    if (currentIndex >= 0 && currentIndex < this.queue.length - 1) {
      this.play(this.queue[currentIndex + 1]);
      return;
    }

    this.isPlaying.set(false);
    this.currentTime.set(audio.duration || 0);
  }
}
