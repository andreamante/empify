import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { appConfig } from './app.config';
import { TrackService } from './core/services/track.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: appConfig.providers,
    })
      .compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the Empify navigation', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.wordmark')?.textContent).toContain('empify');
    expect(compiled.querySelector('.mobile-nav')?.textContent).toContain('Playlist');
  });

  it('should update the favorite state in mock mode', () => {
    const tracks = TestBed.inject(TrackService);
    const track = tracks.tracks()[0];

    tracks.toggleFavorite(track.id).subscribe();

    expect(tracks.tracks()[0].isFavorite).toBe(!track.isFavorite);
  });

  it('should remove a track in mock mode', () => {
    const tracks = TestBed.inject(TrackService);
    const trackId = tracks.tracks()[0].id;
    const initialCount = tracks.tracks().length;

    tracks.deleteTrack(trackId).subscribe();

    expect(tracks.tracks()).toHaveLength(initialCount - 1);
    expect(tracks.tracks().some((track) => track.id === trackId)).toBe(false);
  });
});
