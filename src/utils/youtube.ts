/**
 * Utility functions for YouTube product video parsing and embedding
 * Complies with YouTube Terms of Service and official embed parameters.
 */

export function extractYouTubeId(url: string | undefined | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  // Match:
  // - https://www.youtube.com/watch?v=VIDEO_ID
  // - https://youtu.be/VIDEO_ID
  // - https://www.youtube.com/embed/VIDEO_ID
  // - https://www.youtube.com/shorts/VIDEO_ID
  // - https://m.youtube.com/watch?v=VIDEO_ID
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = trimmed.match(regExp);
  if (match && match[1]) {
    return match[1];
  }

  // Match direct 11-character video ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

export function getYouTubeEmbedUrl(url: string | undefined | null, autoplay = true): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  const ap = autoplay ? '1' : '0';
  return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=${ap}&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`;
}

export function getYouTubeThumbnailUrl(url: string | undefined | null): string | null {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function isYouTubeUrl(url: string | undefined | null): boolean {
  return extractYouTubeId(url) !== null;
}
