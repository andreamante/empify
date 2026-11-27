export interface User {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string | null;
  durationSeconds: number | null;
  mimeType: string;
  fileSize: number | null;
  hasCover: boolean;
  isFavorite: boolean;
  playCount: number | null;
  createdAt: string;
  audioUrl?: string;
  coverUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  tracks?: Track[];
}
