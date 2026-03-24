import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoadingGuard implements CanActivate {
  
  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    // Check if coming from loading screen (allow navigation to profiles)
    const fromLoadingScreen = sessionStorage.getItem('fromLoadingScreen');
    const selectedProfile = localStorage.getItem('selectedProfile');
    
    if (route.routeConfig?.path === 'profiles' && fromLoadingScreen === 'true') {
      // Allow access to profiles page if coming from loading screen
      return true;
    }
    
    // Allow access to all pages if a profile is selected (normal app navigation)
    if (selectedProfile) {
      return true;
    }
    
    // For all other routes, redirect to loading screen
    this.router.navigateByUrl('/');
    return false;
  }
}
