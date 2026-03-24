import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { RESUME_PDF_RELATIVE_PATH, resolveResumeAssetUrl } from '../../constants/resume.constants';

@Component({
  selector: 'app-resume-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './resume-dialog.component.html',
  styleUrls: ['./resume-dialog.component.scss']
})
export class ResumeDialogComponent implements OnInit, OnDestroy {
  loading = true;
  loadError = false;
  safeIframeSrc: SafeResourceUrl | null = null;

  /** Absolute URL used for fetch, download, and “open in new tab”. */
  readonly resolvedUrl: string;

  private objectUrl: string | null = null;

  constructor(
    public dialogRef: MatDialogRef<ResumeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { resumeUrl?: string },
    private sanitizer: DomSanitizer,
    @Inject(DOCUMENT) private document: Document
  ) {
    const raw = (data?.resumeUrl ?? RESUME_PDF_RELATIVE_PATH).trim();
    this.resolvedUrl = resolveResumeAssetUrl(this.document, raw);
  }

  ngOnInit(): void {
    void this.loadPdfIntoIframe();
  }

  ngOnDestroy(): void {
    this.revokeObjectUrl();
  }

  onClose(): void {
    this.dialogRef.close();
  }

  downloadResume(): void {
    const a = this.document.createElement('a');
    a.href = this.resolvedUrl;
    a.download = this.resumeFileName();
    a.rel = 'noopener';
    a.click();
  }

  openInNewTab(): void {
    this.document.defaultView?.open(this.resolvedUrl, '_blank', 'noopener,noreferrer');
  }

  private async loadPdfIntoIframe(): Promise<void> {
    this.loading = true;
    this.loadError = false;
    this.revokeObjectUrl();
    this.safeIframeSrc = null;

    try {
      const res = await fetch(this.resolvedUrl, {
        cache: 'no-store',
        credentials: 'same-origin'
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const ct = (res.headers.get('content-type') || '').toLowerCase();
      if (ct.includes('text/html')) {
        throw new Error('Server returned HTML instead of a PDF');
      }

      const ab = await res.arrayBuffer();
      const bytes = new Uint8Array(ab);

      if (!this.isPdfMagic(bytes)) {
        if (this.looksLikeHtml(bytes)) {
          throw new Error('Got a web page instead of a PDF (wrong path or SPA fallback)');
        }
        throw new Error('File is not a valid PDF');
      }

      const blob = new Blob([ab], { type: 'application/pdf' });
      this.objectUrl = URL.createObjectURL(blob);
      this.safeIframeSrc = this.sanitizer.bypassSecurityTrustResourceUrl(this.objectUrl);
    } catch {
      this.loadError = true;
    } finally {
      this.loading = false;
    }
  }

  private isPdfMagic(bytes: Uint8Array): boolean {
    if (bytes.length < 5) {
      return false;
    }
    const sig = String.fromCharCode(bytes[0], bytes[1], bytes[2], bytes[3], bytes[4]);
    return sig.startsWith('%PDF');
  }

  private looksLikeHtml(bytes: Uint8Array): boolean {
    if (bytes.length === 0) {
      return false;
    }
    if (bytes[0] !== 0x3c) {
      return false;
    }
    const preview = new TextDecoder('utf-8', { fatal: false }).decode(bytes.slice(0, Math.min(256, bytes.length)));
    const t = preview.trimStart().toLowerCase();
    return t.startsWith('<!doctype') || t.startsWith('<html') || t.startsWith('<head');
  }

  private revokeObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }

  private resumeFileName(): string {
    try {
      const u = new URL(this.resolvedUrl);
      const seg = u.pathname.split('/').filter(Boolean).pop();
      return seg && seg.endsWith('.pdf') ? seg : 'resume.pdf';
    } catch {
      return 'resume.pdf';
    }
  }
}
