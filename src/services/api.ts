import type { GrooveXVideo } from '../types/video';

function joinUrl(base: string, path: string): string {
  const b = base.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${b}${p}`;
}

/** RN often surfaces failures only as "Network request failed" — include the URL for debugging. */
async function fetchOrExplain(url: string, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    throw new Error(`${msg} (${url})`);
  }
}

export async function fetchHealth(
  baseUrl: string
): Promise<{ ok: boolean; name?: string }> {
  const url = joinUrl(baseUrl, '/api/health');
  const res = await fetchOrExplain(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`Server returned ${res.status} (${url})`);
  return res.json() as Promise<{ ok: boolean; name?: string }>;
}

export async function fetchVideos(
  baseUrl: string,
  category?: 'audition' | 'dance' | 'all'
): Promise<GrooveXVideo[]> {
  const q =
    category && category !== 'all' ? `?category=${encodeURIComponent(category)}` : '';
  const url = joinUrl(baseUrl, `/api/videos${q}`);
  const res = await fetchOrExplain(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status} (${url})`);
  }
  const data = (await res.json()) as { videos?: GrooveXVideo[] };
  return data.videos ?? [];
}

export async function fetchFeaturedVideos(
  baseUrl: string
): Promise<GrooveXVideo[]> {
  const url = joinUrl(baseUrl, '/api/videos/featured');
  const res = await fetchOrExplain(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(t || `HTTP ${res.status} (${url})`);
  }
  const data = (await res.json()) as { videos?: GrooveXVideo[] };
  return data.videos ?? [];
}
