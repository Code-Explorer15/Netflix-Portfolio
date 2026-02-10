import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface SourceFile {
  name: string;
  path: string;
  type: string;
  content: string;
}

@Component({
  selector: 'app-code-viewer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './code-viewer.component.html',
  styleUrls: ['./code-viewer.component.scss']
})
export class CodeViewerComponent implements OnInit {
  sourceFiles: SourceFile[] = [];
  selectedFile: SourceFile | null = null;
  loading = true;
  

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.checkAuth();
    this.loadSourceFiles();
    
    // Prevent browser back/forward navigation
    this.preventBrowserNavigation();
  }

  private preventBrowserNavigation() {
    // Replace current history entry to prevent back navigation
    window.history.replaceState(null, '', '/developer/code');
    
    // Listen for popstate events (back/forward button clicks)
    window.addEventListener('popstate', (event) => {
      // Always redirect to profile selection
      this.router.navigateByUrl('/');
      // Clear session data
      localStorage.removeItem('selectedProfile');
      localStorage.removeItem('portfolioAccess');
      localStorage.removeItem('authToken');
      // Replace history again to prevent further back navigation
      window.history.replaceState(null, '', '/');
    });
  }

  checkAuth() {
    // Check if user came from profile selection
    const selectedProfile = localStorage.getItem('selectedProfile');
    if (!selectedProfile || selectedProfile !== 'developer') {
      this.router.navigate(['/']);
      return;
    }
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      this.router.navigate(['/developer/login']);
      return;
    }
  }

  loadSourceFiles() {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.http.get<SourceFile[]>('http://localhost:5000/api/portfolio/source-files', { headers })
      .subscribe({
        next: (files) => {
          this.sourceFiles = files;
          if (files.length > 0) {
            this.selectedFile = files[0];
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading source files:', error);
          if (error.status === 401) {
            localStorage.removeItem('authToken');
            this.router.navigate(['/developer/login']);
          }
          this.loading = false;
        }
      });
  }

  selectFile(file: SourceFile) {
    this.selectedFile = file;
  }

  getFileIcon(type: string): string {
    switch (type.toLowerCase()) {
      case 'typescript':
        return '📄';
      case 'csharp':
        return '🔷';
      case 'html':
        return '🌐';
      case 'css':
      case 'scss':
        return '🎨';
      case 'json':
        return '📋';
      default:
        return '📄';
    }
  }

  getLanguageClass(type: string): string {
    return `language-${type.toLowerCase()}`;
  }

  logout() {
    localStorage.removeItem('authToken');
    this.router.navigate(['/']);
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
