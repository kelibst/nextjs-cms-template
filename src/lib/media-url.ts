/**
 * Resolves any media URL to a usable absolute or root-relative URL.
 * Handles:
 *   - Full URLs (MinIO, external): returned as-is
 *   - Root-relative paths (/images/..., /uploads/...): returned as-is
 *   - Bare relative keys: prefixed with NEXT_PUBLIC_MEDIA_BASE_URL
 *   - null/undefined: returns placeholder
 */
export function getMediaUrl(url: string | null | undefined): string {
  if (!url) return '/images/placeholder.jpg';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return url;
  const base = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'http://localhost:9000/gaphto-media';
  return `${base}/${url}`;
}
