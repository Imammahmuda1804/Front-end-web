// Mengubah URL YouTube menjadi URL embed yang aman ditampilkan.
export function getYouTubeEmbedUrl(url?: string | null) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    let videoId = '';

    if (host === 'youtu.be') {
      videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    } else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (parsed.pathname.startsWith('/watch')) {
        videoId = parsed.searchParams.get('v') || '';
      } else if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/')) {
        videoId = parsed.pathname.split('/').filter(Boolean)[1] || '';
      }
    }

    return videoId ? `https://www.youtube.com/embed/${videoId}` : null;
  } catch {
    return null;
  }
}

// Membersihkan nama topik dari label teknis model.
export function cleanTopicName(name?: string) {
  const cleaned = name?.replace(/^Topic \d+:\s*/, '').trim();
  return cleaned || 'Topik perjalanan';
}

export function formatPercent(value: number | null) {
  return value !== null ? `${Math.round(value * 100)}%` : 'N/A';
}

export function formatScore(value: number | null) {
  return value !== null ? Math.round(value * 100) : null;
}

export function ratingText(value: number | null | undefined) {
  return value ? value.toFixed(1) : '-';
}

export function distanceKm(
  origin: { latitude: number | null; longitude: number | null },
  destination: { latitude: number | null; longitude: number | null },
) {
  if (
    typeof origin.latitude !== 'number' ||
    typeof origin.longitude !== 'number' ||
    typeof destination.latitude !== 'number' ||
    typeof destination.longitude !== 'number'
  ) return null;
  const toRad = (value: number) => (value * Math.PI) / 180;
  const latDistance = toRad(destination.latitude - origin.latitude);
  const lonDistance = toRad(destination.longitude - origin.longitude);
  const a = Math.sin(latDistance / 2) ** 2 +
    Math.cos(toRad(origin.latitude)) *
      Math.cos(toRad(destination.latitude)) *
      Math.sin(lonDistance / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}
