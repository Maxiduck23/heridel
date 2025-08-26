import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy všechny API requesty na váš PHP server
      '/api': {
        target: 'http://localhost', // nebo váš PHP server URL
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api') // zachová /api cestu
      }
    }
  }
})