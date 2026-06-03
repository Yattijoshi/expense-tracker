import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite config:
 *  - React plugin for JSX transform & Fast Refresh
 *  - Dev server on port 5173
 *  - Proxy: all /api/* requests → Express on port 3001 (no CORS issues in dev)
 */
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
