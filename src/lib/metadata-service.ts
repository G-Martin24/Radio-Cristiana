/**
 * Service to fetch and parse live Christian radio metadata and artwork
 * from the SonicPanel/RadioStreaming provider endpoints.
 */

export interface StationMetadata {
  artist: string;
  title: string;
  artwork: string | null;
  updatedAt: string;
}

// In-memory cache to prevent excessive requests to the stream provider
let cachedMetadata: StationMetadata | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10 seconds cache

/**
 * Decodes standard HTML entities commonly returned by PHP widgets
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

/**
 * Parses raw track string into Artist and Song Title.
 * If separator is absent or invalid, returns the full string as title.
 */
export function parseTrackInfo(rawText: string): { artist: string; title: string } {
  const clean = decodeHtmlEntities(rawText || '').replace(/\s+/g, ' ').trim();
  if (!clean) {
    return {
      artist: '',
      title: 'Transmisión en Vivo',
    };
  }

  // Common separators: ' - ', ' – ', ' — '
  const separatorMatch = clean.match(/\s+[-–—]\s+/);
  if (separatorMatch && separatorMatch.index !== undefined) {
    const artist = clean.slice(0, separatorMatch.index).trim();
    const title = clean.slice(separatorMatch.index + separatorMatch[0].length).trim();

    if (artist && title) {
      return { artist, title };
    }
  }

  // Fallback if no clean separator is present
  return {
    artist: '',
    title: clean,
  };
}

/**
 * Fetches current metadata from radiostreaming.pro endpoints.
 * Returns the official Radio Poder logo for artwork, omitting outdated banner images.
 */
export async function getStationMetadata(forceRefresh = false): Promise<StationMetadata> {
  const now = Date.now();

  // Return cached result if valid
  if (!forceRefresh && cachedMetadata && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedMetadata;
  }

  const timestamp = String(now);
  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  let rawNowPlayText = '';

  // Fetch Now Playing text
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const nowPlayParams = new URLSearchParams({
      rsys: 'scv2',
      port: '8440',
      NoCache: timestamp,
    });

    const res = await fetch('https://radiostreaming.pro/cp/widgets/player/nowplay.php', {
      method: 'POST',
      headers: commonHeaders,
      body: nowPlayParams.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      rawNowPlayText = await res.text();
      console.log('[Metadata:nowplay] Success (status 200). Length:', rawNowPlayText.length, 'Preview:', rawNowPlayText.slice(0, 80));
    } else {
      console.warn('[Metadata:nowplay] Non-OK HTTP status:', res.status, res.statusText);
    }
  } catch (err) {
    console.warn('[Metadata:nowplay] Request failed:', (err as Error).message);
  }

  const { artist, title } = parseTrackInfo(rawNowPlayText);
  console.log('[Metadata:parse] Parsed track -> Artist:', JSON.stringify(artist), 'Title:', JSON.stringify(title));

  const result: StationMetadata = {
    artist: artist,
    title: title || (cachedMetadata ? cachedMetadata.title : 'Alabanza & Adoración en Vivo'),
    artwork: '/assets/logo-radio-poder.png',
    updatedAt: new Date().toISOString(),
  };

  cachedMetadata = result;
  lastCacheTime = now;

  return result;
}
