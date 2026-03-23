import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react-swc'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    (VitePWA as any)({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'Roboto.ttf',
        'Roboto-Italic.ttf',
      ],
      manifest: {
        name: 'Suit up Solitaire',
        short_name: 'Solitaire',
        description: 'A modern twist on classic solitaire.',
        theme_color: '#45a173',
        background_color: '#45a173',
        display: 'standalone',
        orientation: 'any',
        start_url: '/suit-up-solitaire/',
        scope: '/suit-up-solitaire/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,ttf,woff,woff2}'],
      },
    }),
  ],
  base: '/suit-up-solitaire/',
})
