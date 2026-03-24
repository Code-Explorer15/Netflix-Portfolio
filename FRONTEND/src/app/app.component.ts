import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Bharath Kumar Bandi - Portfolio';

  constructor(private router: Router) {}

  ngOnInit() {
    // Clear any stored authentication or session data
    localStorage.removeItem('authToken');
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('portfolioAccess');
    sessionStorage.removeItem('fromLoadingScreen');
    
    // Prevent browser back/forward navigation and refresh
    this.preventBrowserNavigation();
    this.preventRefresh();
  }

  private preventBrowserNavigation() {
    // Listen for popstate events (back/forward button clicks)
    window.addEventListener('popstate', (event) => {
      const currentUrl = this.router.url;
      const selectedProfile = localStorage.getItem('selectedProfile');
      
      // Define routes that should always redirect to loading screen on back
      const restrictedRoutes = ['/', '/profiles'];
      
      // Only restrict navigation if no profile is selected or on restricted routes
      if (restrictedRoutes.includes(currentUrl) || !selectedProfile) {
        this.router.navigateByUrl('/');
        // Replace history to prevent further back navigation
        window.history.replaceState(null, '', '/');
      }
      // For other routes with selected profile, allow normal back navigation
    });
  }

  private preventRefresh() {
    // Prevent page refresh and redirect to loading screen
    window.addEventListener('beforeunload', (event) => {
      // Clear any stored data on refresh
      localStorage.removeItem('authToken');
      localStorage.removeItem('selectedProfile');
      localStorage.removeItem('portfolioAccess');
    });

    // Handle page load/refresh
    window.addEventListener('load', () => {
      // Always redirect to loading screen on any page load
      this.router.navigateByUrl('/');
    });
  }
}
