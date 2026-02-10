import { Routes } from '@angular/router';
import { LoadingGuard } from './guards/loading-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/loading-screen/loading-screen.component').then(m => m.LoadingScreenComponent)
  },
  {
    path: 'profiles',
    loadComponent: () => import('./components/profile-selection/profile-selection.component').then(m => m.ProfileSelectionComponent),
    canActivate: [LoadingGuard]
  },
  {
    path: 'recruiter',
    loadComponent: () => import('./components/recruiter-home/recruiter-home.component').then(m => m.RecruiterHomeComponent),
    canActivate: [LoadingGuard]
  },
  {
    path: 'developer/login',
    loadComponent: () => import('./components/developer-login/developer-login.component').then(m => m.DeveloperLoginComponent),
    canActivate: [LoadingGuard]
  },
  {
    path: 'developer/code',
    loadComponent: () => import('./components/code-viewer/code-viewer.component').then(m => m.CodeViewerComponent),
    canActivate: [LoadingGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
