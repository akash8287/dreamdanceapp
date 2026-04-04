import type { GrooveXVideo } from '../types/video';

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

export async function fetchHealth(
  baseUrl: string
): Promise<{ ok: boolean; name?: string }> {
  const res = await fetch(joinUrl(baseUrl, '/api/health'), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Server returned ${res.status}`);
  return res.json() as Promise<{ ok: boolean; name?: string }>;
}

export async function fetchVideos(
  baseUrl: string,
  category?: 'audition' | 'dance' | 'all'
): Promise<GrooveXVideo[]> {
  const q =
    category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const res = await fetch(joinUrl(baseUrl, `/api/videos${q}`), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { videos?: GrooveXVideo[] };
  return data.videos ?? [];
}

export async function fetchFeaturedVideos(
  baseUrl: string
): Promise<GrooveXVideo[]> {
  const res = await fetch(joinUrl(baseUrl, '/api/videos/featured'), {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status}`);
  }
  const data = (await res.json()) as { videos?: GrooveXVideo[] };
  return data.videos ?? [];
}
