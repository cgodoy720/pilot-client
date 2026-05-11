// Shared URL guards for any href that's rendered from API-supplied data.
// Use these everywhere we render `href={someApiField}` to avoid javascript:,
// data:, vbscript:, file:, intent:, etc. URLs slipping through into the DOM.

const SAFE_HTTP_PROTOCOLS = new Set(['http:', 'https:']);

// Returns the URL only if it parses to an http(s) scheme. Anything else
// (javascript:, data:, vbscript:, mailto:, relative paths, garbage) → null.
// Caller should use `href={safeExternalUrl(url) || undefined}` so React drops
// the attribute entirely when the value is unsafe.
export function safeExternalUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  try {
    const parsed = new URL(trimmed);
    if (!SAFE_HTTP_PROTOCOLS.has(parsed.protocol)) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

// Convert a `gs://bucket/path/to/object.pdf` URL into a browser-openable
// https://storage.cloud.google.com/... URL. URL-encodes the bucket and each
// path segment so traversal characters (`..`, `?`, `#`, spaces, etc.) cannot
// inject into the resulting URL.
export function gcsToBrowserUrl(gsUrl) {
  if (typeof gsUrl !== 'string' || !gsUrl.startsWith('gs://')) return null;
  const withoutScheme = gsUrl.slice('gs://'.length);
  const slashIndex = withoutScheme.indexOf('/');
  if (slashIndex === -1) return null;
  const bucket = withoutScheme.slice(0, slashIndex);
  const objectPath = withoutScheme.slice(slashIndex + 1);
  if (!bucket || !objectPath) return null;
  const safeBucket = encodeURIComponent(bucket);
  const safeObjectPath = objectPath
    .split('/')
    .map(encodeURIComponent)
    .join('/');
  return `https://storage.cloud.google.com/${safeBucket}/${safeObjectPath}`;
}

// Combo helper: if the value already looks like an http(s) URL, returns it
// (validated). If it's a gs:// URL, converts it (encoded). Anything else → null.
export function toSafeBrowserUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('gs://')) return gcsToBrowserUrl(trimmed);
  return safeExternalUrl(trimmed);
}
