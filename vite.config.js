// /root/osv-tank-manager/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path'; // ✅ Required for alias resolution

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // ✅ Use '@' as alias for src/
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'code.nealcloudservices.com',
      protocol: 'ws',
    },
    allowedHosts: [
      'code.nealcloudservices.com',
    ],
  }
});
