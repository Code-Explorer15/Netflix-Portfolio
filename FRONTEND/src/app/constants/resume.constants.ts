/**
 * PDF file placed under FRONTEND/src/assets/resume/ (copied to /assets/resume/ at build).
 * Change the filename here if your file uses a different name.
 */
export const RESUME_PDF_RELATIVE_PATH = 'assets/resume/Full_Stack_Developer.pdf';

export function resolveResumeAssetUrl(doc: Document, path: string): string {
  const p = path.trim();
  if (p.startsWith('http://') || p.startsWith('https://')) {
    return p;
  }
  return new URL(p.replace(/^\//, ''), doc.baseURI).href;
}
