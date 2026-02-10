import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-selection',
  standalone: true,
  templateUrl: './profile-selection.component.html',
  styleUrls: ['./profile-selection.component.scss']
})
export class ProfileSelectionComponent {
  constructor(private router: Router) {}

  selectRecruiter() {
    localStorage.setItem('selectedProfile', 'recruiter');
    sessionStorage.removeItem('fromLoadingScreen'); // Clear session flag
    this.router.navigate(['/recruiter']);
  }

  selectDeveloper() {
    localStorage.setItem('selectedProfile', 'developer');
    sessionStorage.removeItem('fromLoadingScreen'); // Clear session flag
    this.router.navigate(['/developer/login']);
  }

  selectStalker() {
    // For now, redirect to recruiter view (you can customize this later)
    localStorage.setItem('selectedProfile', 'recruiter');
    sessionStorage.removeItem('fromLoadingScreen'); // Clear session flag
    this.router.navigate(['/recruiter']);
  }

  selectAdventurer() {
    // For now, redirect to recruiter view (you can customize this later)
    localStorage.setItem('selectedProfile', 'recruiter');
    sessionStorage.removeItem('fromLoadingScreen'); // Clear session flag
    this.router.navigate(['/recruiter']);
  }
}
