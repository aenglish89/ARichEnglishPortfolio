import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import { BOOKING_URL, SITE_URL } from './src/config.js';

// Replaces %BOOKING_URL% and %SITE_URL% in every HTML page so the constants live in one file.
function constantsPlugin() {
  return {
    name: 'knightrip-constants',
    transformIndexHtml(html) {
      return html.replaceAll('%BOOKING_URL%', BOOKING_URL).replaceAll('%SITE_URL%', SITE_URL);
    },
    // `vite preview` serves /charging/ but not /charging; Netlify and Vercel handle that
    // themselves (see netlify.toml and vercel.json), so mirror it locally.
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.url === '/charging') req.url = '/charging/';
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [constantsPlugin()],
  appType: 'mpa',
  build: {
    target: 'es2020',
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        charging: resolve(__dirname, 'charging/index.html'),
      },
    },
  },
});
