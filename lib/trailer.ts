// lib/trailer.ts — turn a per-world `trailer` value into something playable.
// Accepts YouTube/Vimeo share links (any common shape) and returns an embed URL,
// or an absolute self-hosted video file. Returns null for empty values and for
// the placeholder /assets/*.mp4 paths, so those worlds keep showing "coming soon"
// until a real link is added.

export function toEmbedUrl(raw: string): string | null {
  if (!raw) return null;
  const url = raw.trim();

  // Already an embed URL — use as-is.
  if (/\/embed\//.test(url) || /player\.vimeo\.com/.test(url)) return url;

  // youtu.be/<id>
  let m = url.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // youtube.com/watch?v=<id>
  m = url.match(/youtube\.com\/watch\?[^#]*\bv=([A-Za-z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // youtube.com/shorts/<id>
  m = url.match(/youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // vimeo.com/<id> or vimeo.com/video/<id>
  m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;

  // Absolute, self-hosted video file (played via <video>, not an iframe).
  if (/^https?:\/\/.+\.(mp4|webm|mov)(\?|#|$)/i.test(url)) return url;

  return null;
}

/** True when the trailer is a self-hosted file we should render in <video>. */
export function isVideoFile(raw: string): boolean {
  return /^https?:\/\/.+\.(mp4|webm|mov)(\?|#|$)/i.test((raw || "").trim());
}
