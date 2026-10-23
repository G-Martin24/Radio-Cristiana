import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { getStationMetadata } from './src/lib/metadata-service.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route for station metadata
app.get('/api/station-metadata', async (req, res) => {
  try {
    const data = await getStationMetadata();
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=15');
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      artist: '',
      title: 'Transmisión en Vivo',
      artwork: null,
      updatedAt: new Date().toISOString(),
      error: err?.message || 'Error fetching metadata',
    });
  }
});

app.post('/api/station-metadata', async (req, res) => {
  try {
    const data = await getStationMetadata();
    return res.json(data);
  } catch (err: any) {
    return res.status(500).json({
      artist: '',
      title: 'Transmisión en Vivo',
      artwork: null,
      updatedAt: new Date().toISOString(),
      error: err?.message || 'Error fetching metadata',
    });
  }
});

// Serve static assets from dist in production
const distDir = path.resolve(__dirname, 'dist');
app.use(express.static(distDir));

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(distDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
