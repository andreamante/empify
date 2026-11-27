import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'library' },
  {
    path: 'library',
    canActivate: [authGuard],
    data: { filter: 'all' },
    loadComponent: () => import('./features/library/library-page').then((module) => module.LibraryPage),
  },
  {
    path: 'favorites',
    canActivate: [authGuard],
    data: { filter: 'favorites' },
    loadComponent: () => import('./features/library/library-page').then((module) => module.LibraryPage),
  },
  {
    path: 'playlists',
    canActivate: [authGuard],
    loadComponent: () => import('./features/playlists/playlists-page').then((module) => module.PlaylistsPage),
  },
  {
    path: 'upload',
    canActivate: [authGuard],
    loadComponent: () => import('./features/upload/upload-page').then((module) => module.UploadPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login-page').then((module) => module.LoginPage),
  },
  { path: '**', redirectTo: 'library' },
];
