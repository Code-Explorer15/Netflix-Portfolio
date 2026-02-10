import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-resume-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './resume-dialog.component.html',
  styleUrls: ['./resume-dialog.component.scss']
})
export class ResumeDialogComponent {
  resumeUrl: string;

  constructor(
    public dialogRef: MatDialogRef<ResumeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { resumeUrl: string }
  ) {
    this.resumeUrl = data.resumeUrl;
    console.log('ResumeDialogComponent initialized with URL:', this.resumeUrl);
  }

  onClose(): void {
    this.dialogRef.close();
  }

  downloadResume(): void {
    const link = document.createElement('a');
    link.href = '/assets/resume/Bharath_Resume__.pdf';
    link.download = 'Bharath_Resume.pdf';
    link.click();
  }
}