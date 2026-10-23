/**
 * Central configuration for Radio Poder.
 * All settings (Station Name, Stream URL, Refresh Interval, Branding, Colors)
 * are easily customizable from this single file.
 */

export interface StationConfig {
  /** Display name of the Christian radio */
  name: string;
  /** Spiritual subtitle / biblical motto */
  tagline: string;
  /** Live audio stream mount URL */
  streamUrl: string;
  /** Internal serverless endpoint for real-time song title, artist and album art */
  metadataEndpoint: string;
  /** Metadata polling interval in milliseconds (default: 15s) */
  pollIntervalMs: number;
  /** Main logo asset path */
  logoUrl: string;
  /** Theme palette and brand tokens */
  theme: {
    background: string;
    surfaceCard: string;
    surfaceElevated: string;
    goldAccent: string;
    orangeAccent: string;
    textPrimary: string;
    textSecondary: string;
  };
}

export const STATION_CONFIG: StationConfig = {
  name: 'Radio Poder',
  tagline: 'Alabanza, Adoración y Palabra Viva las 24 horas',
  streamUrl: 'https://radiostreaming.pro:7219/stream',
  metadataEndpoint: '/api/station-metadata',
  pollIntervalMs: 15000, // Every 15 seconds
  logoUrl: '/assets/logo-radio-poder.png',
  theme: {
    background: '#060913',
    surfaceCard: '#0B132B',
    surfaceElevated: '#141E3D',
    goldAccent: '#D4AF37',
    orangeAccent: '#F59E0B',
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
  },
};
