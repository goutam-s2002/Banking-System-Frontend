import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/auth': 'http://localhost:8080',
      '/accounts': 'http://localhost:8080',
      '/transactions': 'http://localhost:8080',
      '/admin': 'http://localhost:8080'
    }
  }
})
