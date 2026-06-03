import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    alias: {
      /* Mirrors the tsconfig path alias. Single-file alias so all centralized
       * constants live in one place (apps/web/src/constants.ts). */
      '@constants': fileURLToPath(new URL('./src/constants.ts', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'CodeCraft — Learn to code',
        short_name: 'CodeCraft',
        description: 'Interactive coding lessons for ages 9-18. Watch, fix, build.',
        theme_color: '#4f46e5',
        background_color: '#f6f7fb',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        categories: ['education', 'productivity'],
        icons: [
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/icon-512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          {
            name: 'Start the first lesson',
            url: '/lessons/js-variables',
            description: 'Jump straight into JavaScript variables.',
          },
          {
            name: 'Browse the curriculum',
            url: '/lessons',
            description: 'See all lessons.',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
      },
      devOptions: {
        enabled: false,
      },
    }),
  ],
  server: {
    /* Bind to 0.0.0.0 so phones on the same Wi-Fi can hit the dev server.
     * In dev only — production deploys behind their own host. */
    host: true,
    port: 5173,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
