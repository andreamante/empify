export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSeconds: number;
  mimeType: string;
  fileSize: number;
  hasCover: boolean;
  isFavorite: boolean;
  playCount: number;
  createdAt: string;
  audioUrl?: string;
  coverUrl?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  tracks?: Track[];
}
