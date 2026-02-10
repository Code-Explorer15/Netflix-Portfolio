import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

interface LoginResponse {
  token: string;
  username: string;
}

@Component({
  selector: 'app-developer-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './developer-login.component.html',
  styleUrls: ['./developer-login.component.scss']
})
export class DeveloperLoginComponent implements OnInit {
  username = '';
  password = '';
  errorMessage = '';
  loading = false;

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // Check if user came from profile selection
    const selectedProfile = localStorage.getItem('selectedProfile');
    if (!selectedProfile || selectedProfile !== 'developer') {
      this.router.navigate(['/']);
      return;
    }
    
    // Prevent browser back/forward navigation
    this.preventBrowserNavigation();
  }

  private preventBrowserNavigation() {
    // Replace current history entry to prevent back navigation
    window.history.replaceState(null, '', '/developer/login');
    
    // Listen for popstate events (back/forward button clicks)
    window.addEventListener('popstate', (event) => {
      // Always redirect to profile selection
      this.router.navigateByUrl('/');
      // Clear session data
      localStorage.removeItem('selectedProfile');
      localStorage.removeItem('portfolioAccess');
      // Replace history again to prevent further back navigation
      window.history.replaceState(null, '', '/');
    });
  }

  onSubmit() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Please enter both username and password';
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.http.post<LoginResponse>('http://localhost:5000/api/auth/login', {
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response) => {
        // Store token in localStorage
        localStorage.setItem('authToken', response.token);
        this.router.navigate(['/developer/code']);
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Login failed';
        this.loading = false;
      }
    });
  }


  goBack() {
    // Clear all session data
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('portfolioAccess');
    localStorage.removeItem('authToken');
    
    // Navigate to profile selection
    this.router.navigate(['/']);
    
    // Replace browser history to prevent back navigation
    window.history.replaceState(null, '', '/');
  }
}
