import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/kite-api': {
        target: 'https://api.kite.trade',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/kite-api/, ''),
        secure: false,
      },
    },
  },
})
