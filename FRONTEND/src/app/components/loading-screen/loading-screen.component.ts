import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-loading-screen',
  standalone: true,
  templateUrl: './loading-screen.component.html',
  styleUrls: ['./loading-screen.component.scss']
})
export class LoadingScreenComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Clear any stored data when loading screen loads
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('portfolioAccess');
    
    // Prevent back navigation from loading screen
    window.history.replaceState(null, '', '/');
    
    // Auto-redirect to profile selection after portfolio animation completes (2.5 seconds)
    setTimeout(() => {
      // Set flag to allow navigation to profiles page
      sessionStorage.setItem('fromLoadingScreen', 'true');
      this.router.navigate(['/profiles']);
    }, 2500);
  }

  @HostListener('window:popstate', ['$event'])
  onPopState(event: any) {
    // Always redirect to loading screen on back button (loading screen has no profile selected)
    this.router.navigateByUrl('/');
    window.history.replaceState(null, '', '/');
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: any) {
    // Clear data on page unload
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('portfolioAccess');
  }
}
