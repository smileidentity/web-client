import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  // plugins: [basicSsl()],
  server: {
    // Add server configuration here
    proxy: {
      // string shorthand: /api -> http://localhost:3001/api
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true, // needed for virtual hosted sites
        rewrite: (path) => path.replace(/^\/api/, ''), // if your backend doesn't expect /api prefix
      },
    },
  },
});
