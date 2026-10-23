import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function stationMetadataPlugin(): Plugin {
  return {
    name: 'station-metadata-plugin',
    configureServer(server) {
      server.middlewares.use('/api/station-metadata', async (req, res) => {
        try {
          const { getStationMetadata } = await import('./src/lib/metadata-service.ts');
          const data = await getStationMetadata();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Cache-Control', 'no-cache');
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            artist: '',
            title: 'Transmisión en Vivo',
            artwork: null,
            updatedAt: new Date().toISOString(),
          }));
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/station-metadata', async (req, res) => {
        try {
          const { getStationMetadata } = await import('./src/lib/metadata-service.ts');
          const data = await getStationMetadata();
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.end(JSON.stringify(data));
        } catch (err: any) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({
            artist: '',
            title: 'Transmisión en Vivo',
            artwork: null,
            updatedAt: new Date().toISOString(),
          }));
        }
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      stationMetadataPlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.png', 'icons/*.png', 'icons/*.svg'],
        manifest: {
          id: '/',
          name: 'Radio Cristiana Online',
          short_name: 'Radio Cristiana',
          description: 'Radio cristiana en vivo con música de alabanza y adoración, transmisión continua en alta calidad y reproductor PWA.',
          theme_color: '#0B132B',
          background_color: '#060913',
          display: 'standalone',
          orientation: 'portrait-primary',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve('.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
