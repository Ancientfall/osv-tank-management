// /root/osv-tank-manager/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Important to listen on all interfaces on your VPS
    port: 5173,      // Or whatever port Vite is trying to use (default is 5173)
    strictPort: true, // Optional: Makes Vite fail if the port is already in use
    hmr: { // Hot Module Replacement configuration (often needed with custom hosts/proxies)
      host: 'code.nealcloudservices.com', // The host your browser is connecting to
      protocol: 'ws', // Use 'ws' if not using HTTPS for the forwarded host, 'wss' if HTTPS
      // clientPort: 443 // If your external access is on a different port (e.g., 443 for HTTPS)
                       // Usually not needed if the forwarded port matches the Vite port
    },
    allowedHosts: [
      'code.nealcloudservices.com', // Add your specific host here
      // You can add more allowed hosts if needed:
      // 'localhost',
      // '127.0.0.1',
      // 'your-vps-public-ip' // If you also access it directly via IP
    ],
  }
})