import { getStationMetadata } from '../src/lib/metadata-service';

export default async function handler(req: any, res: any) {
  // Set CORS headers so it works everywhere
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=15');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const metadata = await getStationMetadata();
    return res.status(200).json(metadata);
  } catch (err: any) {
    return res.status(500).json({
      error: 'Failed to fetch station metadata',
      message: err?.message || 'Unknown error',
      artist: '',
      title: 'Transmisión en Vivo',
      artwork: null,
      updatedAt: new Date().toISOString(),
    });
  }
}
