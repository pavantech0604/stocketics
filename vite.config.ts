import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // ASP.NET Core API (api/). Same-origin so the HttpOnly session cookie and CSRF header just work.
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:5073',
        changeOrigin: false,
      },
      '/kite-api': {
        target: 'https://api.kite.trade',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kite-api/, ''),
        secure: false,
      },
    },
  },
})
