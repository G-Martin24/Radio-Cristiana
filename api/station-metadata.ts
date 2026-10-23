/**
 * Vercel Serverless Function: /api/station-metadata
 * Configured for Node.js runtime.
 * Fetches real-time artist and song title from nowplay.php on radiostreaming.pro.
 * The central artwork uses the official Radio Poder logo (/assets/logo-radio-poder.png),
 * omitting any outdated external promotional banner images.
 */

export const config = {
  runtime: 'nodejs',
  maxDuration: 10,
};

interface StationMetadata {
  artist: string;
  title: string;
  artwork: string | null;
  updatedAt: string;
}

// In-memory cache in the serverless container instance
let cachedMetadata: StationMetadata | null = null;
let lastCacheTime = 0;
const CACHE_TTL_MS = 10000; // 10s

function decodeHtmlEntities(str: string): string {
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

function parseTrackInfo(rawText: string): { artist: string; title: string } {
  const clean = decodeHtmlEntities(rawText || '').replace(/\s+/g, ' ').trim();
  if (!clean) {
    return { artist: '', title: 'Transmisión en Vivo' };
  }

  const separatorMatch = clean.match(/\s+[-–—]\s+/);
  if (separatorMatch && separatorMatch.index !== undefined) {
    const artist = clean.slice(0, separatorMatch.index).trim();
    const title = clean.slice(separatorMatch.index + separatorMatch[0].length).trim();
    if (artist && title) {
      return { artist, title };
    }
  }

  return { artist: '', title: clean };
}

async function fetchMetadataCore(): Promise<StationMetadata> {
  const now = Date.now();
  if (cachedMetadata && now - lastCacheTime < CACHE_TTL_MS) {
    return cachedMetadata;
  }

  const timestamp = String(now);
  const commonHeaders = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': '*/*',
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  let rawNowPlayText = '';

  // Fetch Now Playing Track Info from radiostreaming.pro
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
      console.log('[Vercel Serverless nowplay.php] HTTP 200, length:', rawNowPlayText.length, 'sample:', rawNowPlayText.slice(0, 60));
    } else {
      console.warn('[Vercel Serverless nowplay.php] HTTP error status:', res.status);
    }
  } catch (err) {
    console.warn('[Vercel Serverless nowplay.php] Fetch error:', (err as Error).message);
  }

  const { artist, title } = parseTrackInfo(rawNowPlayText);

  // Always use the official Radio Poder logo for artwork
  const result: StationMetadata = {
    artist: artist,
    title: title || (cachedMetadata ? cachedMetadata.title : 'Transmisión en Vivo'),
    artwork: '/assets/logo-radio-poder.png',
    updatedAt: new Date().toISOString(),
  };

  cachedMetadata = result;
  lastCacheTime = now;

  return result;
}

// Universal handler supporting both Vercel Node (req, res) and Web standard Request/Response
export default async function handler(req: any, res?: any) {
  // 1. If standard Node.js serverless request/response (res object provided)
  if (res && typeof res.setHeader === 'function') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=15');

    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    try {
      const data = await fetchMetadataCore();
      return res.status(200).json(data);
    } catch (err: any) {
      console.error('[Vercel Serverless] Unhandled exception:', err?.message);
      return res.status(200).json({
        artist: '',
        title: 'Transmisión en Vivo',
        artwork: '/assets/logo-radio-poder.png',
        updatedAt: new Date().toISOString(),
      });
    }
  }

  // 2. Web Standard Fetch API (Edge or Next/Vercel standard Response)
  try {
    const data = await fetchMetadataCore();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Cache-Control': 's-maxage=10, stale-while-revalidate=15',
      },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({
        artist: '',
        title: 'Transmisión en Vivo',
        artwork: '/assets/logo-radio-poder.png',
        updatedAt: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}

// Named exports for modern Vercel / Next API route conventions
export async function GET(request?: any) {
  return handler(request);
}

export async function POST(request?: any) {
  return handler(request);
}
